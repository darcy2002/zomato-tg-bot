export const messageBody = {
    type: "object",
    required: ["session_id", "message"],
    properties: {
        session_id: { type: "string", format: "uuid" },
        message: { type: "string" },
    },
};
export const executeBody = {
    type: "object",
    required: ["session_id", "action"],
    properties: {
        session_id: { type: "string", format: "uuid" },
        action: { type: "string" },
        params: { type: "object" },
    },
};
export const conversationResponse = {
    200: {
        type: "object",
        properties: {
            reply: {
                type: "object",
                properties: {
                    text: { type: "string" },
                    type: { type: "string" },
                },
            },
            intent: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    confidence: { type: "number" },
                    resolved_params: { type: "object" },
                },
            },
            data: { type: "object" },
            suggested_actions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        label: { type: "string" },
                        action: { type: "string" },
                        params: { type: "object" },
                    },
                },
            },
            context_updated: { type: "boolean" },
        },
    },
};
export const postMessage = {
    body: messageBody,
    response: conversationResponse,
};
export const postExecute = {
    body: executeBody,
    response: conversationResponse,
};
//# sourceMappingURL=conversation.js.map