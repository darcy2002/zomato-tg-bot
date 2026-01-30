/**
 * Zomato MCP tool names and param mapping.
 * Align with Zomato MCP server manifest when exact tool names are available.
 */
export const ZOMATO_TOOLS = {
  SEARCH_RESTAURANTS: "search_restaurants",
  GET_MENU: "get_menu",
  ADD_TO_CART: "add_to_cart",
  GET_CART: "get_cart",
  UPDATE_CART: "update_cart",
  PLACE_ORDER: "place_order",
  TRACK_ORDER: "track_order",
} as const;

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
