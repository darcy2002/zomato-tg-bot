export interface ConversationStateRow {
    session_id: string;
    state: Record<string, unknown>;
    updated_at: Date;
}
export declare function get(sessionId: string): Promise<ConversationStateRow | null>;
export declare function upsert(sessionId: string, state: Record<string, unknown>): Promise<ConversationStateRow>;
export declare function merge(sessionId: string, patch: Record<string, unknown>): Promise<ConversationStateRow>;
//# sourceMappingURL=conversation_state.d.ts.map