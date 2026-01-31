/**
 * Run Gemini CLI in headless mode: send a prompt and return the AI response.
 * Uses --prompt and --output-format json; parses stdout for the "response" field.
 */
import { spawn } from "child_process";
const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_CLI_PATH = "gemini";
/**
 * Run Gemini CLI with the given prompt. Returns the text response or an error.
 * Uses headless mode: gemini -p "<prompt>" --output-format json
 */
export function runGeminiCli(prompt, config = { cliPath: DEFAULT_CLI_PATH }) {
    const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const cliPath = config.cliPath.trim();
    const isNpx = cliPath === "npx" || cliPath.startsWith("npx ");
    const [cmd, ...baseArgs] = isNpx
        ? ["npx", "@google/gemini-cli", "-p", prompt, "--output-format", "json"]
        : [cliPath, "-p", prompt, "--output-format", "json"];
    return new Promise((resolve) => {
        const proc = spawn(cmd, baseArgs, {
            stdio: ["ignore", "pipe", "pipe"],
            shell: false,
        });
        let stdout = "";
        let stderr = "";
        proc.stdout?.on("data", (chunk) => {
            stdout += chunk.toString("utf8");
        });
        proc.stderr?.on("data", (chunk) => {
            stderr += chunk.toString("utf8");
        });
        const timer = setTimeout(() => {
            proc.kill("SIGTERM");
            resolve({
                ok: false,
                error: `Gemini CLI timed out after ${timeoutMs / 1000}s. ${stderr ? `Stderr: ${stderr.slice(-500)}` : ""}`,
            });
        }, timeoutMs);
        proc.on("error", (err) => {
            clearTimeout(timer);
            resolve({ ok: false, error: `Failed to start Gemini CLI: ${err.message}` });
        });
        proc.on("close", (code, signal) => {
            clearTimeout(timer);
            if (code !== 0 && signal !== "SIGTERM") {
                resolve({
                    ok: false,
                    error: stderr || stdout || `Process exited with code ${code}`,
                });
                return;
            }
            try {
                const parsed = JSON.parse(stdout);
                if (parsed.response != null && typeof parsed.response === "string") {
                    resolve({ ok: true, response: parsed.response.trim() });
                    return;
                }
                if (parsed.error?.message) {
                    resolve({ ok: false, error: parsed.error.message });
                    return;
                }
            }
            catch {
                // Not JSON or no response field - use raw stdout as reply if present
                const text = stdout.trim();
                if (text) {
                    resolve({ ok: true, response: text });
                    return;
                }
            }
            resolve({
                ok: false,
                error: stderr.trim() || "No response from Gemini CLI",
            });
        });
    });
}
//# sourceMappingURL=gemini-cli.js.map