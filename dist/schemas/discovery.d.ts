import type { FastifySchema } from "fastify";
export declare const searchRestaurantsBody: {
    readonly type: "object";
    readonly required: readonly ["session_id", "lat", "lon"];
    readonly properties: {
        readonly session_id: {
            readonly type: "string";
            readonly format: "uuid";
        };
        readonly query: {
            readonly type: "string";
        };
        readonly lat: {
            readonly type: "number";
        };
        readonly lon: {
            readonly type: "number";
        };
        readonly limit: {
            readonly type: "number";
        };
        readonly offset: {
            readonly type: "number";
        };
    };
};
export declare const searchRestaurants: FastifySchema;
export declare const getMenuParams: {
    readonly type: "object";
    readonly required: readonly ["restaurantId"];
    readonly properties: {
        readonly restaurantId: {
            readonly type: "string";
        };
    };
};
export declare const getMenu: FastifySchema;
//# sourceMappingURL=discovery.d.ts.map