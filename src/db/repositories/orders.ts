/**
 * Order repository: place and track orders; idempotency via idempotency_key.
 */
import { getPool } from "../client.js";

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

export async function create(
  sessionId: string,
  userId: string,
  deliveryAddress: Record<string, unknown>,
  itemsSnapshot: OrderItemSnapshot[],
  totalCents: number,
  currency: string,
  idempotencyKey: string | null,
  zomatoOrderId: string | null,
  estimatedDeliveryAt: Date | null
): Promise<Order> {
  const pool = getPool();
  const result = await pool.query<Order>(
    `INSERT INTO orders (session_id, user_id, delivery_address, items_snapshot, total_cents, currency, idempotency_key, zomato_order_id, status, estimated_delivery_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'placed', $9)
     RETURNING id, session_id, user_id, zomato_order_id, idempotency_key, status, delivery_address, items_snapshot, total_cents, currency, estimated_delivery_at, created_at, updated_at`,
    [
      sessionId,
      userId,
      JSON.stringify(deliveryAddress),
      JSON.stringify(itemsSnapshot),
      totalCents,
      currency,
      idempotencyKey,
      zomatoOrderId,
      estimatedDeliveryAt,
    ]
  );
  return result.rows[0];
}

export async function getById(orderId: string): Promise<Order | null> {
  const pool = getPool();
  const result = await pool.query<Order>(
    `SELECT id, session_id, user_id, zomato_order_id, idempotency_key, status, delivery_address, items_snapshot, total_cents, currency, estimated_delivery_at, created_at, updated_at
     FROM orders WHERE id = $1`,
    [orderId]
  );
  return result.rows[0] ?? null;
}

export async function getByIdempotencyKey(key: string): Promise<Order | null> {
  const pool = getPool();
  const result = await pool.query<Order>(
    `SELECT id, session_id, user_id, zomato_order_id, idempotency_key, status, delivery_address, items_snapshot, total_cents, currency, estimated_delivery_at, created_at, updated_at
     FROM orders WHERE idempotency_key = $1`,
    [key]
  );
  return result.rows[0] ?? null;
}

export async function listBySessionId(
  sessionId: string,
  limit: number,
  offset: number
): Promise<{ orders: Order[]; total: number }> {
  const pool = getPool();
  const [list, count] = await Promise.all([
    pool.query<Order>(
      `SELECT id, session_id, user_id, zomato_order_id, idempotency_key, status, delivery_address, items_snapshot, total_cents, currency, estimated_delivery_at, created_at, updated_at
       FROM orders WHERE session_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [sessionId, limit, offset]
    ),
    pool.query<{ count: string }>(
      "SELECT count(*)::text FROM orders WHERE session_id = $1",
      [sessionId]
    ),
  ]);
  return {
    orders: list.rows,
    total: parseInt(count.rows[0]?.count ?? "0", 10),
  };
}

export async function updateStatus(
  orderId: string,
  status: string,
  estimatedDeliveryAt?: Date | null
): Promise<Order> {
  const pool = getPool();
  const result = await pool.query<Order>(
    `UPDATE orders SET status = $2, estimated_delivery_at = COALESCE($3, estimated_delivery_at), updated_at = now()
     WHERE id = $1
     RETURNING id, session_id, user_id, zomato_order_id, idempotency_key, status, delivery_address, items_snapshot, total_cents, currency, estimated_delivery_at, created_at, updated_at`,
    [orderId, status, estimatedDeliveryAt ?? null]
  );
  return result.rows[0];
}
