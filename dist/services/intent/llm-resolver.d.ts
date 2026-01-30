import type { ResolvedIntent, ConversationContext } from "./types.js";
/**
 * Resolve intent from natural language using OpenAI function calling. Falls back to rule-based resolver if
 * OPENAI_API_KEY is unset, or if the API call fails / returns an invalid tool call.
 */
export declare function resolveWithLLM(message: string, context: ConversationContext): Promise<ResolvedIntent>;
//# sourceMappingURL=llm-resolver.d.ts.map