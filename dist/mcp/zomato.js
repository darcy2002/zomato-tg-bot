/**
 * Zomato MCP wrappers: discover, menu, cart, order.
 * All Zomato operations go through this layer.
 */
import { callZomatoTool } from "./client.js";
import { ZOMATO_TOOLS, } from "./tools.js";
export async function searchRestaurants(params) {
    const result = await callZomatoTool(ZOMATO_TOOLS.SEARCH_RESTAURANTS, {
        query: params.query,
        lat: params.lat,
        lon: params.lon,
        limit: params.limit ?? 10,
        offset: params.offset ?? 0,
    });
    return result;
}
export async function getMenu(restaurantId) {
    const params = { restaurant_id: restaurantId };
    const result = await callZomatoTool(ZOMATO_TOOLS.GET_MENU, params);
    return result;
}
export async function addToCart(params) {
    const result = await callZomatoTool(ZOMATO_TOOLS.ADD_TO_CART, params);
    return result;
}
export async function placeOrder(params) {
    const result = await callZomatoTool(ZOMATO_TOOLS.PLACE_ORDER, params);
    return result;
}
export async function trackOrder(zomatoOrderId) {
    const params = { order_id: zomatoOrderId };
    const result = await callZomatoTool(ZOMATO_TOOLS.TRACK_ORDER, params);
    return result;
}
//# sourceMappingURL=zomato.js.map