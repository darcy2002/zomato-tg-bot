import type { FastifySchema } from "fastify";
export declare const messageBody: {
    readonly type: "object";
    readonly required: readonly ["session_id", "message"];
    readonly properties: {
        readonly session_id: {
            readonly type: "string";
            readonly format: "uuid";
        };
        readonly message: {
            readonly type: "string";
        };
    };
};
export declare const executeBody: {
    readonly type: "object";
    readonly required: readonly ["session_id", "action"];
    readonly properties: {
        readonly session_id: {
            readonly type: "string";
            readonly format: "uuid";
        };
        readonly action: {
            readonly type: "string";
        };
        readonly params: {
            readonly type: "object";
        };
    };
};
export declare const conversationResponse: {
    readonly 200: {
        readonly type: "object";
        readonly properties: {
            readonly reply: {
                readonly type: "object";
                readonly properties: {
                    readonly text: {
                        readonly type: "string";
                    };
                    readonly type: {
                        readonly type: "string";
                    };
                };
            };
            readonly intent: {
                readonly type: "object";
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly confidence: {
                        readonly type: "number";
                    };
                    readonly resolved_params: {
                        readonly type: "object";
                    };
                };
            };
            readonly data: {
                readonly type: "object";
            };
            readonly suggested_actions: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                        };
                        readonly label: {
                            readonly type: "string";
                        };
                        readonly action: {
                            readonly type: "string";
                        };
                        readonly params: {
                            readonly type: "object";
                        };
                    };
                };
            };
            readonly context_updated: {
                readonly type: "boolean";
            };
        };
    };
};
export declare const postMessage: FastifySchema;
export declare const postExecute: FastifySchema;
//# sourceMappingURL=conversation.d.ts.map