/**
 * In-memory conversation history per Telegram chat for Gemini CLI mode.
 * We send the last N turns to Gemini as context so it remembers the flow (e.g. address chosen, restaurant selected).
 */
const MAX_TURNS = 10; // last 10 messages (5 user + 5 assistant)
const byChat = new Map();
function key(chatId) {
    return String(chatId);
}
export function getHistory(chatId) {
    return byChat.get(key(chatId)) ?? [];
}
export function appendTurn(chatId, role, text) {
    const k = key(chatId);
    let list = byChat.get(k) ?? [];
    list = [...list, { role, text }];
    if (list.length > MAX_TURNS) {
        list = list.slice(-MAX_TURNS);
    }
    byChat.set(k, list);
}
/**
 * Build a single prompt string that includes recent conversation + current user message.
 * Gemini CLI only accepts one prompt, so we embed context in it.
 */
export function buildPromptWithHistory(chatId, currentMessage) {
    const history = getHistory(chatId);
    if (history.length === 0) {
        return currentMessage;
    }
    const lines = history.map((t) => `${t.role === "user" ? "User" : "Assistant"}: ${t.text}`);
    return `[Previous conversation]\n${lines.join("\n")}\n\n[Current message from user]\nUser: ${currentMessage}`;
}
//# sourceMappingURL=conversation-history.js.map