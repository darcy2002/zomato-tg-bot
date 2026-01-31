/**
 * Long-running Gemini CLI session using a PTY so the CLI stays in interactive mode and waits for input.
 * One process, one TTY; we write to it and read until response complete.
 */
import * as pty from "node-pty";

const IDLE_MS = 10_000; // no new output => response complete
const MAX_RESPONSE_MS = 120_000;
const INITIAL_WAIT_MS = 10_000; // wait for first prompt after spawn

const ANSI_REGEX =
  /\u001b\[[0-9;]*m|\u001b\]8;;[^\u001b]*\u001b\\|\u001b\[[?0-9;]*[a-zA-Z]/g;
function stripAnsi(s: string): string {
  return s.replace(ANSI_REGEX, "").trim();
}

const PROMPT_LINE_REGEX = /^[\s]*[>\u276f❯]\s*$|^You:\s*$/;
const BANNER_LINE_REGEX = /^\d+\s*MCP server(s)?\.?$/i;
const WAITING_FOR_AUTH_REGEX = /waiting for auth/i;
const ECHO_LINE_REGEX = /^[\s|]*[>\u276f❯]\s*(.+)$/;
const NOISE_LINE_REGEX = /^~\//i;

function isUserEchoLine(line: string, userPromptFirstLine: string): boolean {
  const m = line.match(ECHO_LINE_REGEX);
  if (!m) return false;
  const after = (m[1] ?? "").trim();
  if (after.length > 40) return false;
  if (after === userPromptFirstLine) return true;
  if (userPromptFirstLine && after.toLowerCase() === userPromptFirstLine.toLowerCase()) return true;
  if (after.length <= 15) return true;
  return false;
}

function extractReplyOnly(raw: string, userPromptFirstLine: string): string {
  const lines = raw.split(/\r?\n/).map((l) => stripAnsi(l).trim());
  const kept = lines.filter(
    (l) =>
      l &&
      !BANNER_LINE_REGEX.test(l) &&
      !PROMPT_LINE_REGEX.test(l) &&
      !NOISE_LINE_REGEX.test(l) &&
      l !== userPromptFirstLine &&
      !/^\s*\(.*\*?\)\s*$/.test(l) &&
      !/no sandbox|see \/docs/i.test(l) &&
      !isUserEchoLine(l, userPromptFirstLine),
  );
  const cleaned = kept.map((l) => {
    const m = l.match(/^[\s|]*[>\u276f❯]\s*(.*)$/);
    return m ? (m[1] ?? "").trim() : l;
  });
  return cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export interface GeminiSessionConfig {
  cliPath: string;
  cwd?: string;
}

export interface GeminiSessionResult {
  ok: true;
  response: string;
}

export interface GeminiSessionError {
  ok: false;
  error: string;
}

export type GeminiSessionOutput = GeminiSessionResult | GeminiSessionError;

class GeminiSessionImpl {
  private ptyProc: pty.IPty | null = null;
  private config: GeminiSessionConfig;
  private stdoutBuffer = "";
  private resolveCurrent: ((out: GeminiSessionOutput) => void) | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private maxTimer: ReturnType<typeof setTimeout> | null = null;
  private initialTimer: ReturnType<typeof setTimeout> | null = null;
  private ready = false;
  private sendQueue: Array<() => void> = [];
  private processing = false;
  private lastPrompt = "";
  private loggedWaitingForAuth = false;

  constructor(config: GeminiSessionConfig) {
    this.config = config;
  }

  start(): void {
    if (this.ptyProc) return;
    const cliPath = this.config.cliPath.trim();
    const isNpx = cliPath === "npx" || cliPath.startsWith("npx ");
    const cwd = this.config.cwd || process.cwd();
    const env: Record<string, string> = {};
    for (const [k, v] of Object.entries(process.env)) {
      if (v !== undefined && v !== null && typeof v === "string") env[k] = v;
    }

    let cmd: string;
    let args: string[];
    if (isNpx) {
      cmd = process.platform === "win32" ? (process.env.COMSPEC || "cmd.exe") : "/bin/zsh";
      args = ["-c", "exec npx @google/gemini-cli"];
    } else {
      cmd = cliPath;
      args = [];
    }

    try {
      this.ptyProc = pty.spawn(cmd, args, {
        name: "xterm-256color",
        cols: 120,
        rows: 30,
        cwd,
        env,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[Gemini session] PTY spawn failed:", msg);
      return;
    }

    this.ptyProc.onData((data: string) => {
      this.stdoutBuffer += data;
      if (WAITING_FOR_AUTH_REGEX.test(this.stdoutBuffer) && !this.loggedWaitingForAuth) {
        this.loggedWaitingForAuth = true;
        console.log("[Gemini session] CLI is waiting for sign-in. Run 'npx @google/gemini-cli' in your terminal, sign in, then restart the bot.");
      }
      this.maybeMarkReady();
      this.resetIdleTimer();
    });

    this.ptyProc.onExit(({ exitCode }: { exitCode: number }) => {
      console.log("[Gemini session] process exited code=" + exitCode);
      this.ptyProc = null;
      this.ready = false;
      const res = this.resolveCurrent;
      this.resolveCurrent = null;
      this.clearTimers();
      if (res) {
        const text = stripAnsi(this.stdoutBuffer).trim();
        const errMsg =
          exitCode === 42
            ? "Gemini CLI exited (no TTY / no input). On macOS run: npm run postinstall. Then run 'npx @google/gemini-cli' in a terminal to sign in."
            : `Gemini CLI exited (code ${exitCode})`;
        res(
          text && exitCode !== 42
            ? { ok: true, response: text }
            : { ok: false, error: errMsg },
        );
      }
      this.drainQueue();
    });

    this.stdoutBuffer = "";
    console.log("[Gemini session] started (long-running, PTY — CLI waits for input)");
    this.initialTimer = setTimeout(() => {
      if (!this.ready && this.ptyProc) {
        this.ready = true;
        this.drainQueue();
      }
      this.initialTimer = null;
    }, INITIAL_WAIT_MS);
  }

  private maybeMarkReady(): void {
    if (this.ready || !this.ptyProc) return;
    const raw = stripAnsi(this.stdoutBuffer);
    if (WAITING_FOR_AUTH_REGEX.test(raw)) return; // don't mark ready while CLI is waiting for sign-in
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const lastLine = lines[lines.length - 1] ?? "";
    if (PROMPT_LINE_REGEX.test(lastLine) || /^You:\s*$/.test(lastLine) || /^[>\u276f❯]\s*$/.test(lastLine)) {
      this.ready = true;
      if (this.initialTimer) {
        clearTimeout(this.initialTimer);
        this.initialTimer = null;
      }
      this.drainQueue();
    }
  }

  private clearTimers(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.maxTimer) {
      clearTimeout(this.maxTimer);
      this.maxTimer = null;
    }
    if (this.initialTimer) {
      clearTimeout(this.initialTimer);
      this.initialTimer = null;
    }
  }

  private resetIdleTimer(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => this.onIdle(), IDLE_MS);
  }

  private onIdle(): void {
    this.idleTimer = null;
    this.finishResponse();
  }

  private finishResponse(): void {
    this.clearTimers();
    const res = this.resolveCurrent;
    this.resolveCurrent = null;
    if (!res) return;

    const raw = this.stdoutBuffer;
    const lines = raw.split(/\r?\n/).map((l) => stripAnsi(l));
    let endIdx = lines.length;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (PROMPT_LINE_REGEX.test(lines[i])) {
        endIdx = i;
        break;
      }
    }
    const rawChunk = lines.slice(0, endIdx).join("\n").trim() || raw.trim();

    if (!rawChunk) {
      res({ ok: false, error: "No response from Gemini" });
      this.stdoutBuffer = "";
      this.processing = false;
      this.drainQueue();
      return;
    }

    const chunkLines = rawChunk.split(/\r?\n/).map((l) => stripAnsi(l).trim()).filter(Boolean);
    const onlyEchoOrPrompt = chunkLines.every(
      (l) =>
        BANNER_LINE_REGEX.test(l) ||
        PROMPT_LINE_REGEX.test(l) ||
        l === this.lastPrompt ||
        isUserEchoLine(l, this.lastPrompt),
    );
    if (rawChunk.length < 30 || onlyEchoOrPrompt) {
      const needsAuth = WAITING_FOR_AUTH_REGEX.test(rawChunk) || WAITING_FOR_AUTH_REGEX.test(this.stdoutBuffer);
      res({
        ok: false,
        error: needsAuth
          ? "Gemini CLI is waiting for sign-in. Run 'npx @google/gemini-cli' in your terminal, complete sign-in in the browser, then restart the bot."
          : "Gemini didn't respond in time. Is the CLI signed in? Run: npx @google/gemini-cli in a terminal first.",
      });
      this.stdoutBuffer = "";
      this.processing = false;
      this.drainQueue();
      return;
    }

    const reply = extractReplyOnly(rawChunk, this.lastPrompt);
    res({ ok: true, response: reply || rawChunk });
    this.stdoutBuffer = "";
    this.processing = false;
    this.drainQueue();
  }

  send(prompt: string): Promise<GeminiSessionOutput> {
    return new Promise((resolve) => {
      const doSend = () => {
        if (!this.ptyProc || !this.ready) {
          const raw = stripAnsi(this.stdoutBuffer);
          const needsAuth = this.ptyProc && WAITING_FOR_AUTH_REGEX.test(raw);
          resolve({
            ok: false,
            error: needsAuth
              ? "Gemini CLI is waiting for sign-in. Run 'npx @google/gemini-cli' in your terminal, complete sign-in in the browser, then restart the bot."
              : "Gemini session not running",
          });
          return;
        }
        if (this.processing) {
          this.sendQueue.push(doSend);
          return;
        }
        this.processing = true;
        this.resolveCurrent = resolve;
        const trimmed = typeof prompt === "string" ? prompt.trim() : "";
        if (!trimmed) {
          this.processing = false;
          resolve({ ok: false, error: "Empty message" });
          this.drainQueue();
          return;
        }
        this.lastPrompt = trimmed.split(/\r?\n/)[0] ?? "";
        // Send as user would type: message + Enter. \r is the standard PTY line terminator.
        const toSend = trimmed + "\r";
        this.ptyProc.write(toSend);
        if (process.env.DEBUG_GEMINI_SESSION) {
          console.log("[Gemini session] sent", toSend.length, "chars:", JSON.stringify(trimmed.slice(0, 80)) + (trimmed.length > 80 ? "…" : ""));
        }
        // Allow PTY to flush before we start the idle timer
        setImmediate(() => this.resetIdleTimer());
        this.maxTimer = setTimeout(() => {
          this.maxTimer = null;
          if (this.resolveCurrent) {
            this.resolveCurrent({
              ok: false,
              error: `Gemini session timed out after ${MAX_RESPONSE_MS / 1000}s`,
            });
            this.resolveCurrent = null;
          }
          this.clearTimers();
          this.stdoutBuffer = "";
          this.processing = false;
          this.drainQueue();
        }, MAX_RESPONSE_MS);
      };
      doSend();
    });
  }

  private drainQueue(): void {
    if (this.sendQueue.length > 0 && !this.processing) {
      const next = this.sendQueue.shift();
      if (next) next();
    }
  }

  stop(): void {
    this.clearTimers();
    this.sendQueue = [];
    const res = this.resolveCurrent;
    this.resolveCurrent = null;
    if (res) res({ ok: false, error: "Session stopped" });
    this.processing = false;
    if (this.ptyProc) {
      this.ptyProc.kill();
      this.ptyProc = null;
    }
    this.ready = false;
  }

  isRunning(): boolean {
    return this.ptyProc !== null;
  }
}

let session: GeminiSessionImpl | null = null;

export function getGeminiSession(config: GeminiSessionConfig): GeminiSessionImpl {
  if (!session) {
    session = new GeminiSessionImpl(config);
    session.start();
  }
  return session;
}

export function isGeminiSessionRunning(): boolean {
  return session?.isRunning() ?? false;
}

export function stopGeminiSession(): void {
  if (session) {
    session.stop();
    session = null;
  }
}

export function sendViaSession(
  prompt: string,
  config: GeminiSessionConfig,
): Promise<GeminiSessionOutput> {
  const s = getGeminiSession(config);
  return s.send(prompt);
}
