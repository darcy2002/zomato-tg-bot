export interface CartItemSnapshot {
    line_id: string;
    item_id: string;
    name: string;
    quantity: number;
    price_cents: number;
    customizations?: unknown[];
}
export interface Cart {
    id: string;
    session_id: string;
    restaurant_id: string;
    zomato_cart_id: string | null;
    items_snapshot: CartItemSnapshot[];
    subtotal_cents: number;
    currency: string;
    created_at: Date;
    updated_at: Date;
}
export declare function getBySessionId(sessionId: string): Promise<Cart | null>;
export declare function create(sessionId: string, restaurantId: string, zomatoCartId: string | null, itemsSnapshot: CartItemSnapshot[], subtotalCents: number, currency: string): Promise<Cart>;
export declare function update(cartId: string, zomatoCartId: string | null, itemsSnapshot: CartItemSnapshot[], subtotalCents: number): Promise<Cart>;
export declare function deleteBySessionId(sessionId: string): Promise<void>;
//# sourceMappingURL=carts.d.ts.map