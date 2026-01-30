import * as ordersRepo from "../db/repositories/orders.js";
export interface PlaceOrderInput {
    session_id: string;
    user_id: string;
    idempotency_key?: string;
    delivery_address: {
        street?: string;
        city: string;
        pin: string;
        instructions?: string;
    };
}
export declare function placeOrder(input: PlaceOrderInput): Promise<{
    order_id: string;
    zomato_order_id: string | null;
    status: string;
    estimated_delivery_at: string | null;
}>;
export declare function getOrderStatus(sessionId: string, orderId: string): Promise<{
    order_id: string;
    zomato_order_id: string;
    status: string;
    items: ordersRepo.OrderItemSnapshot[];
    tracking_url: string | undefined;
} | {
    order_id: string;
    zomato_order_id: string | null;
    status: string;
    items: ordersRepo.OrderItemSnapshot[];
    tracking_url: null;
}>;
export declare function listOrders(sessionId: string, limit: number, offset: number): Promise<{
    orders: ordersRepo.Order[];
    total: number;
}>;
//# sourceMappingURL=order.service.d.ts.map