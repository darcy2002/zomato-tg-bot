/**
 * Discovery service: restaurants and menu via MCP.
 */
import * as conversationStateRepo from "../db/repositories/conversation_state.js";
import * as zomato from "../mcp/zomato.js";
export async function searchRestaurants(input) {
    const result = await zomato.searchRestaurants({
        query: input.query,
        lat: input.lat,
        lon: input.lon,
        limit: input.limit ?? 10,
        offset: input.offset ?? 0,
    });
    return result;
}
export async function getRestaurantMenu(sessionId, restaurantId) {
    const menuResult = await zomato.getMenu(restaurantId);
    await conversationStateRepo.merge(sessionId, {
        last_restaurant_id: restaurantId,
        last_menu_at: new Date().toISOString(),
    });
    return menuResult;
}
//# sourceMappingURL=discovery.service.js.map