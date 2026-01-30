export interface Session {
    id: string;
    user_id: string;
    created_at: Date;
    updated_at: Date;
}
export declare function createSession(userId: string): Promise<Session>;
export declare function getById(sessionId: string): Promise<Session | null>;
export declare function getOrCreateForUser(userId: string): Promise<Session>;
//# sourceMappingURL=sessions.d.ts.map