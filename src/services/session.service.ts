/**
 * Session service: create or get session; return context summary.
 */
import * as usersRepo from "../db/repositories/users.js";
import * as sessionsRepo from "../db/repositories/sessions.js";
import * as cartsRepo from "../db/repositories/carts.js";
import * as ordersRepo from "../db/repositories/orders.js";
import { ErrorCodes, AppError } from "../lib/errors.js";

export interface CreateSessionInput {
  channel: string;
  channel_user_id: string;
}

export interface SessionResult {
  session_id: string;
  user_id: string;
  created_at: string;
}

export async function createOrGetSession(input: CreateSessionInput): Promise<SessionResult> {
  const user = await usersRepo.findOrCreateUser(input.channel, input.channel_user_id);
  const session = await sessionsRepo.getOrCreateForUser(user.id);
  return {
    session_id: session.id,
    user_id: user.id,
    created_at: session.created_at.toISOString(),
  };
}

export interface SessionContextSummary {
  last_restaurant_id: string | null;
  cart_item_count: number;
  active_order_id: string | null;
}

export async function getSessionWithContext(sessionId: string): Promise<{
  session_id: string;
  user_id: string;
  context: SessionContextSummary;
}> {
  const session = await sessionsRepo.getById(sessionId);
  if (!session) {
    throw new AppError(ErrorCodes.SESSION_NOT_FOUND, "Session not found", 404);
  }
  const [cart, ordersList] = await Promise.all([
    cartsRepo.getBySessionId(sessionId),
    ordersRepo.listBySessionId(sessionId, 1, 0),
  ]);
  const activeOrder = ordersList.orders[0];
  return {
    session_id: session.id,
    user_id: session.user_id,
    context: {
      last_restaurant_id: cart?.restaurant_id ?? null,
      cart_item_count: cart?.items_snapshot?.length ?? 0,
      active_order_id: activeOrder?.id ?? null,
    },
  };
}
