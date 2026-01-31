export interface GeminiCliConfig {
    /** Path to gemini executable (e.g. "gemini" or "npx" with args). Default "gemini". */
    cliPath: string;
    /** Timeout in ms. Default 120000. */
    timeoutMs?: number;
}
export interface GeminiCliResult {
    ok: true;
    response: string;
}
export interface GeminiCliError {
    ok: false;
    error: string;
}
export type GeminiCliOutput = GeminiCliResult | GeminiCliError;
/**
 * Run Gemini CLI with the given prompt. Returns the text response or an error.
 * Uses headless mode: gemini -p "<prompt>" --output-format json
 */
export declare function runGeminiCli(prompt: string, config?: GeminiCliConfig): Promise<GeminiCliOutput>;
//# sourceMappingURL=gemini-cli.d.ts.map