export interface OrderItemSnapshot {
    item_id: string;
    name: string;
    quantity: number;
    price_cents: number;
}
export interface Order {
    id: string;
    session_id: string;
    user_id: string;
    zomato_order_id: string | null;
    idempotency_key: string | null;
    status: string;
    delivery_address: Record<string, unknown>;
    items_snapshot: OrderItemSnapshot[];
    total_cents: number;
    currency: string;
    estimated_delivery_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
export declare function create(sessionId: string, userId: string, deliveryAddress: Record<string, unknown>, itemsSnapshot: OrderItemSnapshot[], totalCents: number, currency: string, idempotencyKey: string | null, zomatoOrderId: string | null, estimatedDeliveryAt: Date | null): Promise<Order>;
export declare function getById(orderId: string): Promise<Order | null>;
export declare function getByIdempotencyKey(key: string): Promise<Order | null>;
export declare function listBySessionId(sessionId: string, limit: number, offset: number): Promise<{
    orders: Order[];
    total: number;
}>;
export declare function updateStatus(orderId: string, status: string, estimatedDeliveryAt?: Date | null): Promise<Order>;
//# sourceMappingURL=orders.d.ts.map