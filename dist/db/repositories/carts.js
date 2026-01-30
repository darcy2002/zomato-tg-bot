/**
 * Cart repository: one active cart per session; sync with Zomato via zomato_cart_id.
 */
import { getPool } from "../client.js";
export async function getBySessionId(sessionId) {
    const pool = getPool();
    const result = await pool.query(`SELECT id, session_id, restaurant_id, zomato_cart_id,
            items_snapshot, subtotal_cents, currency, created_at, updated_at
     FROM carts WHERE session_id = $1`, [sessionId]);
    return result.rows[0] ?? null;
}
export async function create(sessionId, restaurantId, zomatoCartId, itemsSnapshot, subtotalCents, currency) {
    const pool = getPool();
    const result = await pool.query(`INSERT INTO carts (session_id, restaurant_id, zomato_cart_id, items_snapshot, subtotal_cents, currency)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, session_id, restaurant_id, zomato_cart_id, items_snapshot, subtotal_cents, currency, created_at, updated_at`, [sessionId, restaurantId, zomatoCartId, JSON.stringify(itemsSnapshot), subtotalCents, currency]);
    return result.rows[0];
}
export async function update(cartId, zomatoCartId, itemsSnapshot, subtotalCents) {
    const pool = getPool();
    const result = await pool.query(`UPDATE carts SET zomato_cart_id = COALESCE($2, zomato_cart_id), items_snapshot = $3, subtotal_cents = $4, updated_at = now()
     WHERE id = $1
     RETURNING id, session_id, restaurant_id, zomato_cart_id, items_snapshot, subtotal_cents, currency, created_at, updated_at`, [cartId, zomatoCartId, JSON.stringify(itemsSnapshot), subtotalCents]);
    return result.rows[0];
}
export async function deleteBySessionId(sessionId) {
    const pool = getPool();
    await pool.query("DELETE FROM carts WHERE session_id = $1", [sessionId]);
}
//# sourceMappingURL=carts.js.map