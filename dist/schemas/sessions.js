export const createSessionBody = {
    type: "object",
    required: ["channel", "channel_user_id"],
    properties: {
        channel: { type: "string", enum: ["telegram", "web"] },
        channel_user_id: { type: "string" },
    },
};
export const createSession = {
    body: createSessionBody,
    response: {
        201: {
            type: "object",
            properties: {
                session_id: { type: "string", format: "uuid" },
                user_id: { type: "string", format: "uuid" },
                created_at: { type: "string", format: "date-time" },
            },
        },
    },
};
export const getSessionParams = {
    type: "object",
    required: ["sessionId"],
    properties: {
        sessionId: { type: "string", format: "uuid" },
    },
};
export const getSession = {
    params: getSessionParams,
    response: {
        200: {
            type: "object",
            properties: {
                session_id: { type: "string" },
                user_id: { type: "string" },
                context: {
                    type: "object",
                    properties: {
                        last_restaurant_id: { type: ["string", "null"] },
                        cart_item_count: { type: "number" },
                        active_order_id: { type: ["string", "null"] },
                    },
                },
            },
        },
    },
};
//# sourceMappingURL=sessions.js.map