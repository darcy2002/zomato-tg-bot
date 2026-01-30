/**
 * Rule-based intent + entity extraction (v1).
 * Replace with LLM or hybrid later; interface stays resolve(sessionId, message) -> intent + params.
 */
import type { ResolvedIntent, ConversationContext } from "./types.js";
export declare function resolve(message: string, context: ConversationContext): ResolvedIntent;
//# sourceMappingURL=resolver.d.ts.map