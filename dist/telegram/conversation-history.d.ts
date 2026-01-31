/**
 * In-memory conversation history per Telegram chat for Gemini CLI mode.
 * We send the last N turns to Gemini as context so it remembers the flow (e.g. address chosen, restaurant selected).
 */
export interface HistoryTurn {
    role: "user" | "assistant";
    text: string;
}
export declare function getHistory(chatId: number): HistoryTurn[];
export declare function appendTurn(chatId: number, role: "user" | "assistant", text: string): void;
/**
 * Build a single prompt string that includes recent conversation + current user message.
 * Gemini CLI only accepts one prompt, so we embed context in it.
 */
export declare function buildPromptWithHistory(chatId: number, currentMessage: string): string;
//# sourceMappingURL=conversation-history.d.ts.map