/**
 * Order service: place order (idempotent); get status; list orders.
 */
import * as cartsRepo from "../db/repositories/carts.js";
import * as ordersRepo from "../db/repositories/orders.js";
import * as zomato from "../mcp/zomato.js";
import { ErrorCodes, AppError } from "../lib/errors.js";
import type { OrderItemSnapshot } from "../db/repositories/orders.js";

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

export async function placeOrder(input: PlaceOrderInput) {
  if (input.idempotency_key) {
    const existing = await ordersRepo.getByIdempotencyKey(input.idempotency_key);
    if (existing) {
      return {
        order_id: existing.id,
        zomato_order_id: existing.zomato_order_id,
        status: existing.status,
        estimated_delivery_at: existing.estimated_delivery_at?.toISOString() ?? null,
      };
    }
  }

  const cart = await cartsRepo.getBySessionId(input.session_id);
  if (!cart) {
    throw new AppError(ErrorCodes.CART_NOT_FOUND, "No cart to place order", 404);
  }
  if (!cart.zomato_cart_id) {
    throw new AppError(ErrorCodes.MCP_ERROR, "Cart not synced with Zomato", 502);
  }

  const mcpResult = await zomato.placeOrder({
    cart_id: cart.zomato_cart_id,
    delivery_address: input.delivery_address,
  });

  const itemsSnapshot: OrderItemSnapshot[] = (cart.items_snapshot ?? []).map((i) => ({
    item_id: i.item_id,
    name: i.name,
    quantity: i.quantity,
    price_cents: i.price_cents,
  }));
  const totalCents = cart.subtotal_cents;
  const estimatedAt = mcpResult.estimated_delivery_at
    ? new Date(mcpResult.estimated_delivery_at)
    : null;

  const order = await ordersRepo.create(
    input.session_id,
    input.user_id,
    input.delivery_address,
    itemsSnapshot,
    totalCents,
    cart.currency,
    input.idempotency_key ?? null,
    mcpResult.order_id,
    estimatedAt
  );

  await cartsRepo.deleteBySessionId(input.session_id);

  return {
    order_id: order.id,
    zomato_order_id: order.zomato_order_id,
    status: order.status,
    estimated_delivery_at: order.estimated_delivery_at?.toISOString() ?? null,
  };
}

export async function getOrderStatus(sessionId: string, orderId: string) {
  const order = await ordersRepo.getById(orderId);
  if (!order || order.session_id !== sessionId) {
    throw new AppError(ErrorCodes.ORDER_NOT_FOUND, "Order not found", 404);
  }
  if (order.zomato_order_id) {
    const track = await zomato.trackOrder(order.zomato_order_id);
    await ordersRepo.updateStatus(orderId, track.status);
    return {
      order_id: order.id,
      zomato_order_id: order.zomato_order_id,
      status: track.status,
      items: order.items_snapshot,
      tracking_url: track.tracking_url,
    };
  }
  return {
    order_id: order.id,
    zomato_order_id: order.zomato_order_id,
    status: order.status,
    items: order.items_snapshot,
    tracking_url: null,
  };
}

export async function listOrders(sessionId: string, limit: number, offset: number) {
  return ordersRepo.listBySessionId(sessionId, limit, offset);
}
