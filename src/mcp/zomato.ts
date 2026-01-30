/**
 * Zomato MCP wrappers: discover, menu, cart, order.
 * All Zomato operations go through this layer.
 */
import { callZomatoTool } from "./client.js";
import {
  ZOMATO_TOOLS,
  type SearchRestaurantsParams,
  type GetMenuParams,
  type AddToCartParams,
  type PlaceOrderParams,
  type TrackOrderParams,
} from "./tools.js";

export interface Restaurant {
  id: string;
  name: string;
  cuisine?: string;
  rating?: number;
  delivery_time_min?: number;
  address?: string;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  currency?: string;
  description?: string;
}

export interface CartItem {
  line_id: string;
  item_id: string;
  name: string;
  quantity: number;
  price_cents: number;
}

export async function searchRestaurants(
  params: SearchRestaurantsParams
): Promise<{ restaurants: Restaurant[]; total?: number }> {
  const result = await callZomatoTool<{ restaurants: Restaurant[]; total?: number }>(
    ZOMATO_TOOLS.SEARCH_RESTAURANTS,
    {
      query: params.query,
      lat: params.lat,
      lon: params.lon,
      limit: params.limit ?? 10,
      offset: params.offset ?? 0,
    }
  );
  return result;
}

export async function getMenu(restaurantId: string): Promise<{
  restaurant: { id: string; name: string };
  categories: MenuCategory[];
}> {
  const params: GetMenuParams = { restaurant_id: restaurantId };
  const result = await callZomatoTool<{
    restaurant: { id: string; name: string };
    categories: MenuCategory[];
  }>(ZOMATO_TOOLS.GET_MENU, params);
  return result;
}

export async function addToCart(params: AddToCartParams): Promise<{
  cart_id: string;
  items: CartItem[];
  subtotal_cents: number;
  currency: string;
}> {
  const result = await callZomatoTool<{
    cart_id: string;
    items: CartItem[];
    subtotal_cents: number;
    currency: string;
  }>(ZOMATO_TOOLS.ADD_TO_CART, params);
  return result;
}

export async function placeOrder(params: PlaceOrderParams): Promise<{
  order_id: string;
  status: string;
  estimated_delivery_at?: string;
}> {
  const result = await callZomatoTool<{
    order_id: string;
    status: string;
    estimated_delivery_at?: string;
  }>(ZOMATO_TOOLS.PLACE_ORDER, params);
  return result;
}

export async function trackOrder(zomatoOrderId: string): Promise<{
  order_id: string;
  status: string;
  tracking_url?: string;
  items?: unknown[];
}> {
  const params: TrackOrderParams = { order_id: zomatoOrderId };
  const result = await callZomatoTool<{
    order_id: string;
    status: string;
    tracking_url?: string;
    items?: unknown[];
  }>(ZOMATO_TOOLS.TRACK_ORDER, params);
  return result;
}
