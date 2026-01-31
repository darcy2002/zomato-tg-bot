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
declare class GeminiSessionImpl {
    private ptyProc;
    private config;
    private buffer;
    private resolveCurrent;
    private idleTimer;
    private maxTimer;
    private ready;
    private sendQueue;
    private processing;
    private lastPrompt;
    constructor(config: GeminiSessionConfig);
    start(): void;
    private clearTimers;
    private resetIdleTimer;
    private onIdle;
    private finishResponse;
    send(prompt: string): Promise<GeminiSessionOutput>;
    private drainQueue;
    stop(): void;
    isRunning(): boolean;
}
export declare function getGeminiSession(config: GeminiSessionConfig): GeminiSessionImpl;
export declare function stopGeminiSession(): void;
export declare function sendViaSession(prompt: string, config: GeminiSessionConfig): Promise<GeminiSessionOutput>;
export {};
//# sourceMappingURL=gemini-session.d.ts.map