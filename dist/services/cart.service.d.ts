/**
 * Cart service: get current cart; add/update items; sync with MCP and DB.
 */
import * as cartsRepo from "../db/repositories/carts.js";
export declare function getCurrentCart(sessionId: string): Promise<{
    cart_id: string;
    restaurant_id: string;
    items: cartsRepo.CartItemSnapshot[];
    subtotal_cents: number;
    currency: string;
} | null>;
export interface AddItemInput {
    session_id: string;
    restaurant_id: string;
    item_id: string;
    quantity: number;
    customizations?: unknown[];
}
export declare function addItem(input: AddItemInput): Promise<{
    cart_id: string;
    items: cartsRepo.CartItemSnapshot[];
    subtotal_cents: number;
    currency: string;
}>;
export declare function clearCart(sessionId: string): Promise<void>;
//# sourceMappingURL=cart.service.d.ts.map