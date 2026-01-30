import type { FastifySchema } from "fastify";
export declare const createSessionBody: {
    readonly type: "object";
    readonly required: readonly ["channel", "channel_user_id"];
    readonly properties: {
        readonly channel: {
            readonly type: "string";
            readonly enum: readonly ["telegram", "web"];
        };
        readonly channel_user_id: {
            readonly type: "string";
        };
    };
};
export declare const createSession: FastifySchema;
export declare const getSessionParams: {
    readonly type: "object";
    readonly required: readonly ["sessionId"];
    readonly properties: {
        readonly sessionId: {
            readonly type: "string";
            readonly format: "uuid";
        };
    };
};
export declare const getSession: FastifySchema;
//# sourceMappingURL=sessions.d.ts.map