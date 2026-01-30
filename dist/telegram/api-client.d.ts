/**
 * Thin HTTP client for the backend API. Used by the Telegram bot only.
 */
export interface SessionResponse {
    session_id: string;
    user_id: string;
    created_at: string;
}
export interface SuggestedAction {
    id: string;
    label: string;
    action: string;
    params: Record<string, unknown>;
}
export interface ConversationResponse {
    reply: {
        text: string;
        type: string;
    };
    intent: {
        name: string;
        confidence: number;
        resolved_params: Record<string, unknown>;
    };
    data?: Record<string, unknown>;
    suggested_actions: SuggestedAction[];
    context_updated: boolean;
}
export declare class BackendApiError extends Error {
    statusCode: number;
    body?: unknown | undefined;
    constructor(message: string, statusCode: number, body?: unknown | undefined);
}
export declare function createApiClient(baseUrl: string): {
    createOrGetSession(channel: string, channelUserId: string): Promise<SessionResponse>;
    sendMessage(sessionId: string, message: string): Promise<ConversationResponse>;
    executeAction(sessionId: string, action: string, params: Record<string, unknown>): Promise<ConversationResponse>;
};
//# sourceMappingURL=api-client.d.ts.map