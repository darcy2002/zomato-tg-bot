/**
 * In-memory conversation history per Telegram chat for Gemini CLI mode.
 * We send the last N turns to Gemini as context so it remembers the flow (e.g. address chosen, restaurant selected).
 */

const MAX_TURNS = 6; // last 6 messages (3 from user + 3 from bot)

export interface HistoryTurn {
  role: "user" | "assistant";
  text: string;
}

const byChat = new Map<string, HistoryTurn[]>();

function key(chatId: number): string {
  return String(chatId);
}

export function getHistory(chatId: number): HistoryTurn[] {
  return byChat.get(key(chatId)) ?? [];
}

export function appendTurn(chatId: number, role: "user" | "assistant", text: string): void {
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
 * One-shot Gemini CLI only accepts one prompt, so we embed full context in it.
 */
export function buildPromptWithHistory(chatId: number, currentMessage: string): string {
  const history = getHistory(chatId);
  if (history.length === 0) {
    return currentMessage;
  }
  const lines = history.map((t) => `${t.role === "user" ? "User" : "Assistant"}: ${t.text}`);
  return `This is a continuing conversation. Previous messages:\n\n${lines.join("\n")}\n\nUser: ${currentMessage}`;
}
