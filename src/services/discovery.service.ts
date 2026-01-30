/**
 * Discovery service: restaurants and menu via MCP.
 */
import * as conversationStateRepo from "../db/repositories/conversation_state.js";
import * as zomato from "../mcp/zomato.js";

export interface SearchRestaurantsInput {
  session_id: string;
  query?: string;
  lat: number;
  lon: number;
  limit?: number;
  offset?: number;
}

export async function searchRestaurants(input: SearchRestaurantsInput) {
  const result = await zomato.searchRestaurants({
    query: input.query,
    lat: input.lat,
    lon: input.lon,
    limit: input.limit ?? 10,
    offset: input.offset ?? 0,
  });
  return result;
}

export async function getRestaurantMenu(
  sessionId: string,
  restaurantId: string
): Promise<{
  restaurant: { id: string; name: string };
  categories: Array<{ name: string; items: Array<{ id: string; name: string; price: number; currency?: string; description?: string }> }>;
}> {
  const menuResult = await zomato.getMenu(restaurantId);
  await conversationStateRepo.merge(sessionId, {
    last_restaurant_id: restaurantId,
    last_menu_at: new Date().toISOString(),
  });
  return menuResult;
}
