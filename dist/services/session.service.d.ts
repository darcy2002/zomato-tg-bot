export interface CreateSessionInput {
    channel: string;
    channel_user_id: string;
}
export interface SessionResult {
    session_id: string;
    user_id: string;
    created_at: string;
}
export declare function createOrGetSession(input: CreateSessionInput): Promise<SessionResult>;
export interface SessionContextSummary {
    last_restaurant_id: string | null;
    cart_item_count: number;
    active_order_id: string | null;
}
export declare function getSessionWithContext(sessionId: string): Promise<{
    session_id: string;
    user_id: string;
    context: SessionContextSummary;
}>;
//# sourceMappingURL=session.service.d.ts.map