/**
 * Zomato MCP tool names and param mapping.
 * Align with Zomato MCP server manifest when exact tool names are available.
 */
export declare const ZOMATO_TOOLS: {
    readonly SEARCH_RESTAURANTS: "search_restaurants";
    readonly GET_MENU: "get_menu";
    readonly ADD_TO_CART: "add_to_cart";
    readonly GET_CART: "get_cart";
    readonly UPDATE_CART: "update_cart";
    readonly PLACE_ORDER: "place_order";
    readonly TRACK_ORDER: "track_order";
};
export type ZomatoToolName = (typeof ZOMATO_TOOLS)[keyof typeof ZOMATO_TOOLS];
export interface SearchRestaurantsParams {
    query?: string;
    lat: number;
    lon: number;
    limit?: number;
    offset?: number;
}
export interface GetMenuParams {
    restaurant_id: string;
}
export interface AddToCartParams {
    restaurant_id: string;
    item_id: string;
    quantity: number;
    customizations?: unknown[];
}
export interface PlaceOrderParams {
    cart_id: string;
    delivery_address: {
        street?: string;
        city: string;
        pin: string;
        instructions?: string;
    };
}
export interface TrackOrderParams {
    order_id: string;
}
//# sourceMappingURL=tools.d.ts.map