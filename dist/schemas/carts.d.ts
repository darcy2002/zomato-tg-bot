import type { FastifySchema } from "fastify";
export declare const addItemBody: {
    readonly type: "object";
    readonly required: readonly ["session_id", "restaurant_id", "item_id", "quantity"];
    readonly properties: {
        readonly session_id: {
            readonly type: "string";
            readonly format: "uuid";
        };
        readonly restaurant_id: {
            readonly type: "string";
        };
        readonly item_id: {
            readonly type: "string";
        };
        readonly quantity: {
            readonly type: "number";
        };
        readonly customizations: {
            readonly type: "array";
        };
    };
};
export declare const updateItemParams: {
    readonly type: "object";
    readonly required: readonly ["lineId"];
    readonly properties: {
        readonly lineId: {
            readonly type: "string";
            readonly format: "uuid";
        };
    };
};
export declare const updateItemBody: {
    readonly type: "object";
    readonly required: readonly ["session_id", "quantity"];
    readonly properties: {
        readonly session_id: {
            readonly type: "string";
            readonly format: "uuid";
        };
        readonly quantity: {
            readonly type: "number";
        };
    };
};
export declare const cartResponse: {
    readonly type: "object";
    readonly properties: {
        readonly cart_id: {
            readonly type: "string";
        };
        readonly restaurant_id: {
            readonly type: "string";
        };
        readonly items: {
            readonly type: "array";
        };
        readonly subtotal_cents: {
            readonly type: "number";
        };
        readonly currency: {
            readonly type: "string";
        };
    };
};
export declare const getCurrentCart: FastifySchema;
export declare const postCartItems: FastifySchema;
export declare const patchCartItem: FastifySchema;
//# sourceMappingURL=carts.d.ts.map