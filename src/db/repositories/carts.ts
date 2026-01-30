/**
 * Cart repository: one active cart per session; sync with Zomato via zomato_cart_id.
 */
import { getPool } from "../client.js";

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

export async function getBySessionId(sessionId: string): Promise<Cart | null> {
  const pool = getPool();
  const result = await pool.query<Cart>(
    `SELECT id, session_id, restaurant_id, zomato_cart_id,
            items_snapshot, subtotal_cents, currency, created_at, updated_at
     FROM carts WHERE session_id = $1`,
    [sessionId]
  );
  return result.rows[0] ?? null;
}

export async function create(
  sessionId: string,
  restaurantId: string,
  zomatoCartId: string | null,
  itemsSnapshot: CartItemSnapshot[],
  subtotalCents: number,
  currency: string
): Promise<Cart> {
  const pool = getPool();
  const result = await pool.query<Cart>(
    `INSERT INTO carts (session_id, restaurant_id, zomato_cart_id, items_snapshot, subtotal_cents, currency)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, session_id, restaurant_id, zomato_cart_id, items_snapshot, subtotal_cents, currency, created_at, updated_at`,
    [sessionId, restaurantId, zomatoCartId, JSON.stringify(itemsSnapshot), subtotalCents, currency]
  );
  return result.rows[0];
}

export async function update(
  cartId: string,
  zomatoCartId: string | null,
  itemsSnapshot: CartItemSnapshot[],
  subtotalCents: number
): Promise<Cart> {
  const pool = getPool();
  const result = await pool.query<Cart>(
    `UPDATE carts SET zomato_cart_id = COALESCE($2, zomato_cart_id), items_snapshot = $3, subtotal_cents = $4, updated_at = now()
     WHERE id = $1
     RETURNING id, session_id, restaurant_id, zomato_cart_id, items_snapshot, subtotal_cents, currency, created_at, updated_at`,
    [cartId, zomatoCartId, JSON.stringify(itemsSnapshot), subtotalCents]
  );
  return result.rows[0];
}

export async function deleteBySessionId(sessionId: string): Promise<void> {
  const pool = getPool();
  await pool.query("DELETE FROM carts WHERE session_id = $1", [sessionId]);
}
