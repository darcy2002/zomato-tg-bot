import * as zomato from "../mcp/zomato.js";
export interface SearchRestaurantsInput {
    session_id: string;
    query?: string;
    lat: number;
    lon: number;
    limit?: number;
    offset?: number;
}
export declare function searchRestaurants(input: SearchRestaurantsInput): Promise<{
    restaurants: zomato.Restaurant[];
    total?: number;
}>;
export declare function getRestaurantMenu(sessionId: string, restaurantId: string): Promise<{
    restaurant: {
        id: string;
        name: string;
    };
    categories: Array<{
        name: string;
        items: Array<{
            id: string;
            name: string;
            price: number;
            currency?: string;
            description?: string;
        }>;
    }>;
}>;
/** Stub data when Zomato MCP is unavailable (e.g. domain not whitelisted). */
export declare function getStubRestaurants(query: string, limit: number): Array<{
    id: string;
    name: string;
    cuisine?: string;
    rating?: number;
    delivery_time_min?: number;
}>;
/** Stub menu when Zomato MCP is unavailable. */
export declare function getStubMenu(restaurantId: string): {
    restaurant: {
        id: string;
        name: string;
    };
    categories: Array<{
        name: string;
        items: Array<{
            id: string;
            name: string;
            price: number;
            currency?: string;
            description?: string;
        }>;
    }>;
};
//# sourceMappingURL=discovery.service.d.ts.map