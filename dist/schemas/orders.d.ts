import type { FastifySchema } from "fastify";
export declare const placeOrderBody: {
    readonly type: "object";
    readonly required: readonly ["session_id", "delivery_address"];
    readonly properties: {
        readonly session_id: {
            readonly type: "string";
            readonly format: "uuid";
        };
        readonly idempotency_key: {
            readonly type: "string";
        };
        readonly delivery_address: {
            readonly type: "object";
            readonly required: readonly ["city", "pin"];
            readonly properties: {
                readonly street: {
                    readonly type: "string";
                };
                readonly city: {
                    readonly type: "string";
                };
                readonly pin: {
                    readonly type: "string";
                };
                readonly instructions: {
                    readonly type: "string";
                };
            };
        };
    };
};
export declare const placeOrder: FastifySchema;
export declare const getOrderParams: {
    readonly type: "object";
    readonly required: readonly ["orderId"];
    readonly properties: {
        readonly orderId: {
            readonly type: "string";
            readonly format: "uuid";
        };
    };
};
export declare const getOrder: FastifySchema;
export declare const listOrdersQuerystring: {
    readonly type: "object";
    readonly properties: {
        readonly limit: {
            readonly type: "number";
        };
        readonly offset: {
            readonly type: "number";
        };
    };
};
export declare const listOrders: FastifySchema;
//# sourceMappingURL=orders.d.ts.map