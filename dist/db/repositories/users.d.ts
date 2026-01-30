export interface User {
    id: string;
    channel: string;
    channel_user_id: string;
    created_at: Date;
    updated_at: Date;
}
export declare function findOrCreateUser(channel: string, channelUserId: string): Promise<User>;
export declare function getById(id: string): Promise<User | null>;
//# sourceMappingURL=users.d.ts.map