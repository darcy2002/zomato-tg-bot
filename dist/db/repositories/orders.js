/**
 * Order repository: place and track orders; idempotency via idempotency_key.
 */
import { getPool } from "../client.js";
export async function create(sessionId, userId, deliveryAddress, itemsSnapshot, totalCents, currency, idempotencyKey, zomatoOrderId, estimatedDeliveryAt) {
    const pool = getPool();
    const result = await pool.query(`INSERT INTO orders (session_id, user_id, delivery_address, items_snapshot, total_cents, currency, idempotency_key, zomato_order_id, status, estimated_delivery_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'placed', $9)
     RETURNING id, session_id, user_id, zomato_order_id, idempotency_key, status, delivery_address, items_snapshot, total_cents, currency, estimated_delivery_at, created_at, updated_at`, [
        sessionId,
        userId,
        JSON.stringify(deliveryAddress),
        JSON.stringify(itemsSnapshot),
        totalCents,
        currency,
        idempotencyKey,
        zomatoOrderId,
        estimatedDeliveryAt,
    ]);
    return result.rows[0];
}
export async function getById(orderId) {
    const pool = getPool();
    const result = await pool.query(`SELECT id, session_id, user_id, zomato_order_id, idempotency_key, status, delivery_address, items_snapshot, total_cents, currency, estimated_delivery_at, created_at, updated_at
     FROM orders WHERE id = $1`, [orderId]);
    return result.rows[0] ?? null;
}
export async function getByIdempotencyKey(key) {
    const pool = getPool();
    const result = await pool.query(`SELECT id, session_id, user_id, zomato_order_id, idempotency_key, status, delivery_address, items_snapshot, total_cents, currency, estimated_delivery_at, created_at, updated_at
     FROM orders WHERE idempotency_key = $1`, [key]);
    return result.rows[0] ?? null;
}
export async function listBySessionId(sessionId, limit, offset) {
    const pool = getPool();
    const [list, count] = await Promise.all([
        pool.query(`SELECT id, session_id, user_id, zomato_order_id, idempotency_key, status, delivery_address, items_snapshot, total_cents, currency, estimated_delivery_at, created_at, updated_at
       FROM orders WHERE session_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [sessionId, limit, offset]),
        pool.query("SELECT count(*)::text FROM orders WHERE session_id = $1", [sessionId]),
    ]);
    return {
        orders: list.rows,
        total: parseInt(count.rows[0]?.count ?? "0", 10),
    };
}
export async function updateStatus(orderId, status, estimatedDeliveryAt) {
    const pool = getPool();
    const result = await pool.query(`UPDATE orders SET status = $2, estimated_delivery_at = COALESCE($3, estimated_delivery_at), updated_at = now()
     WHERE id = $1
     RETURNING id, session_id, user_id, zomato_order_id, idempotency_key, status, delivery_address, items_snapshot, total_cents, currency, estimated_delivery_at, created_at, updated_at`, [orderId, status, estimatedDeliveryAt ?? null]);
    return result.rows[0];
}
//# sourceMappingURL=orders.js.map