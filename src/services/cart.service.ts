/**
 * Cart service: get current cart; add/update items; sync with MCP and DB.
 */
import * as cartsRepo from "../db/repositories/carts.js";
import * as zomato from "../mcp/zomato.js";
import { ErrorCodes, AppError } from "../lib/errors.js";
import type { CartItemSnapshot } from "../db/repositories/carts.js";

export async function getCurrentCart(sessionId: string) {
  const cart = await cartsRepo.getBySessionId(sessionId);
  if (!cart) return null;
  return {
    cart_id: cart.id,
    restaurant_id: cart.restaurant_id,
    items: cart.items_snapshot,
    subtotal_cents: cart.subtotal_cents,
    currency: cart.currency,
  };
}

export interface AddItemInput {
  session_id: string;
  restaurant_id: string;
  item_id: string;
  quantity: number;
  customizations?: unknown[];
}

export async function addItem(input: AddItemInput) {
  const existing = await cartsRepo.getBySessionId(input.session_id);
  let cartId: string;
  let zomatoCartId: string | null;
  let itemsSnapshot: CartItemSnapshot[];
  let subtotalCents: number;
  let currency: string;

  const mcpResult = await zomato.addToCart({
    restaurant_id: input.restaurant_id,
    item_id: input.item_id,
    quantity: input.quantity,
    customizations: input.customizations,
  });

  zomatoCartId = mcpResult.cart_id;
  itemsSnapshot = mcpResult.items as CartItemSnapshot[];
  subtotalCents = mcpResult.subtotal_cents;
  currency = mcpResult.currency ?? "INR";

  if (existing) {
    if (existing.restaurant_id !== input.restaurant_id) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "Cart is for another restaurant; clear cart first",
        400
      );
    }
    const updated = await cartsRepo.update(
      existing.id,
      zomatoCartId,
      itemsSnapshot,
      subtotalCents
    );
    cartId = updated.id;
  } else {
    const created = await cartsRepo.create(
      input.session_id,
      input.restaurant_id,
      zomatoCartId,
      itemsSnapshot,
      subtotalCents,
      currency
    );
    cartId = created.id;
  }

  const cart = await cartsRepo.getBySessionId(input.session_id);
  return {
    cart_id: cart!.id,
    items: cart!.items_snapshot,
    subtotal_cents: cart!.subtotal_cents,
    currency: cart!.currency,
  };
}

export async function clearCart(sessionId: string): Promise<void> {
  await cartsRepo.deleteBySessionId(sessionId);
}
