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

/** Stub data when Zomato MCP is unavailable (e.g. domain not whitelisted). */
export function getStubRestaurants(query: string, limit: number): Array<{ id: string; name: string; cuisine?: string; rating?: number; delivery_time_min?: number }> {
  const names = [
    "The Biryani House",
    "Pizza Palace",
    "Curry Corner",
    "Tandoori Nights",
    "Spice Garden",
  ];
  return names.slice(0, limit).map((name, i) => ({
    id: `stub-restaurant-${i + 1}`,
    name,
    cuisine: query || "Multi-cuisine",
    rating: 4.0 + (i % 3) * 0.2,
    delivery_time_min: 30 + i * 5,
  }));
}

/** Stub menu when Zomato MCP is unavailable. */
export function getStubMenu(restaurantId: string): {
  restaurant: { id: string; name: string };
  categories: Array<{ name: string; items: Array<{ id: string; name: string; price: number; currency?: string; description?: string }> }>;
} {
  const name = restaurantId.startsWith("stub-") ? "Sample Restaurant" : "Sample Restaurant";
  return {
    restaurant: { id: restaurantId, name },
    categories: [
      {
        name: "Main Course",
        items: [
          { id: "stub-item-1", name: "Biryani Bowl", price: 29900, currency: "INR", description: "Aromatic rice with spices" },
          { id: "stub-item-2", name: "Butter Chicken", price: 34900, currency: "INR", description: "Creamy tomato curry" },
        ],
      },
    ],
  };
}
