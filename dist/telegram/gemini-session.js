/**
 * Single persistent Gemini CLI session (one process, PTY).
 * Fixes context (same process = same conversation) and latency (no cold start per message).
 */
import * as pty from "node-pty";
const DEFAULT_CLI_PATH = "gemini";
const IDLE_MS = 3500; // no new output for this long => response complete
const MAX_RESPONSE_MS = 120_000;
const INITIAL_WAIT_MS = 8000; // wait for Gemini to show first prompt after spawn
// Strip ANSI escape sequences
const ANSI_REGEX = /\u001b\[[0-9;]*m|\u001b\]8;;[^\u001b]*\u001b\\|\u001b\[[?0-9;]*[a-zA-Z]/g;
function stripAnsi(s) {
    return s.replace(ANSI_REGEX, "").trim();
}
// Lines that look like "next prompt" in Gemini CLI (response ended)
const PROMPT_LINE_REGEX = /^[\s]*[>\u276f❯]\s*$|^You:\s*$/;
class GeminiSessionImpl {
    ptyProc = null;
    config;
    buffer = "";
    resolveCurrent = null;
    idleTimer = null;
    maxTimer = null;
    ready = false;
    sendQueue = [];
    processing = false;
    lastPrompt = "";
    constructor(config) {
        this.config = config;
    }
    start() {
        if (this.ptyProc)
            return;
        const cliPath = this.config.cliPath.trim();
        const isNpx = cliPath === "npx" || cliPath.startsWith("npx ");
        const [cmd, ...args] = isNpx ? ["npx", "@google/gemini-cli"] : [cliPath, ""].filter(Boolean);
        const finalArgs = args.filter((a) => a !== "");
        this.ptyProc = pty.spawn(cmd, finalArgs.length ? finalArgs : [], {
            name: "xterm-256color",
            cols: 120,
            rows: 30,
            cwd: this.config.cwd || process.cwd(),
            env: process.env,
        });
        this.ptyProc.onData((data) => {
            this.buffer += data;
            this.resetIdleTimer();
        });
        this.ptyProc.onExit(({ exitCode }) => {
            this.ptyProc = null;
            this.ready = false;
            const res = this.resolveCurrent;
            this.resolveCurrent = null;
            this.clearTimers();
            if (res) {
                const text = stripAnsi(this.buffer);
                res(text ? { ok: true, response: text } : { ok: false, error: `Gemini CLI exited with code ${exitCode}` });
            }
            this.drainQueue();
        });
        this.buffer = "";
        setTimeout(() => {
            this.ready = true;
            this.drainQueue();
        }, INITIAL_WAIT_MS);
    }
    clearTimers() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
        if (this.maxTimer) {
            clearTimeout(this.maxTimer);
            this.maxTimer = null;
        }
    }
    resetIdleTimer() {
        if (this.idleTimer)
            clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => this.onIdle(), IDLE_MS);
    }
    onIdle() {
        this.idleTimer = null;
        this.finishResponse();
    }
    finishResponse() {
        this.clearTimers();
        const res = this.resolveCurrent;
        this.resolveCurrent = null;
        if (!res)
            return;
        const raw = this.buffer;
        const lines = raw.split(/\r?\n/);
        let responseLines = [];
        let foundPrompt = false;
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];
            if (PROMPT_LINE_REGEX.test(stripAnsi(line))) {
                responseLines = lines.slice(0, i);
                foundPrompt = true;
                break;
            }
        }
        let responseText = (foundPrompt ? responseLines : lines).join("\n");
        const cleaned = stripAnsi(responseText);
        // Remove echoed first line of user prompt if present
        let trimmed = cleaned.replace(/\n{3,}/g, "\n\n").trim();
        if (this.lastPrompt && trimmed.startsWith(this.lastPrompt)) {
            const after = trimmed.slice(this.lastPrompt.length).replace(/^\r?\n+/, "");
            if (after)
                trimmed = after;
        }
        if (trimmed) {
            res({ ok: true, response: trimmed });
        }
        else {
            const fallback = stripAnsi(raw).trim();
            res(fallback ? { ok: true, response: fallback } : { ok: false, error: "No response from Gemini" });
        }
        this.buffer = "";
        this.processing = false;
        this.drainQueue();
    }
    send(prompt) {
        return new Promise((resolve) => {
            const doSend = () => {
                if (!this.ptyProc || !this.ready) {
                    resolve({ ok: false, error: "Gemini session not running" });
                    return;
                }
                if (this.processing) {
                    this.sendQueue.push(doSend);
                    return;
                }
                this.processing = true;
                this.resolveCurrent = resolve;
                this.buffer = "";
                this.lastPrompt = prompt.split(/\r?\n/)[0]?.trim() ?? "";
                this.ptyProc.write(prompt + "\r\n");
                this.resetIdleTimer();
                this.maxTimer = setTimeout(() => {
                    this.maxTimer = null;
                    if (this.resolveCurrent) {
                        this.resolveCurrent({ ok: false, error: `Gemini session timed out after ${MAX_RESPONSE_MS / 1000}s` });
                        this.resolveCurrent = null;
                    }
                    this.clearTimers();
                    this.buffer = "";
                    this.processing = false;
                    this.drainQueue();
                }, MAX_RESPONSE_MS);
            };
            doSend();
        });
    }
    drainQueue() {
        if (this.sendQueue.length > 0 && !this.processing) {
            const next = this.sendQueue.shift();
            if (next)
                next();
        }
    }
    stop() {
        this.clearTimers();
        this.sendQueue = [];
        const res = this.resolveCurrent;
        this.resolveCurrent = null;
        if (res)
            res({ ok: false, error: "Session stopped" });
        this.processing = false;
        if (this.ptyProc) {
            this.ptyProc.kill();
            this.ptyProc = null;
        }
        this.ready = false;
    }
    isRunning() {
        return this.ptyProc !== null;
    }
}
let session = null;
export function getGeminiSession(config) {
    if (!session) {
        session = new GeminiSessionImpl(config);
        session.start();
    }
    return session;
}
export function stopGeminiSession() {
    if (session) {
        session.stop();
        session = null;
    }
}
export function sendViaSession(prompt, config) {
    const s = getGeminiSession(config);
    return s.send(prompt);
}
//# sourceMappingURL=gemini-session.js.map