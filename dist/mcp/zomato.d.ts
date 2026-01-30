import { type SearchRestaurantsParams, type AddToCartParams, type PlaceOrderParams } from "./tools.js";
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
export declare function searchRestaurants(params: SearchRestaurantsParams): Promise<{
    restaurants: Restaurant[];
    total?: number;
}>;
export declare function getMenu(restaurantId: string): Promise<{
    restaurant: {
        id: string;
        name: string;
    };
    categories: MenuCategory[];
}>;
export declare function addToCart(params: AddToCartParams): Promise<{
    cart_id: string;
    items: CartItem[];
    subtotal_cents: number;
    currency: string;
}>;
export declare function placeOrder(params: PlaceOrderParams): Promise<{
    order_id: string;
    status: string;
    estimated_delivery_at?: string;
}>;
export declare function trackOrder(zomatoOrderId: string): Promise<{
    order_id: string;
    status: string;
    tracking_url?: string;
    items?: unknown[];
}>;
//# sourceMappingURL=zomato.d.ts.map