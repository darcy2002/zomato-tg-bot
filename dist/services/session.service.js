/**
 * Session service: create or get session; return context summary.
 */
import * as usersRepo from "../db/repositories/users.js";
import * as sessionsRepo from "../db/repositories/sessions.js";
import * as cartsRepo from "../db/repositories/carts.js";
import * as ordersRepo from "../db/repositories/orders.js";
import { ErrorCodes, AppError } from "../lib/errors.js";
export async function createOrGetSession(input) {
    const user = await usersRepo.findOrCreateUser(input.channel, input.channel_user_id);
    const session = await sessionsRepo.getOrCreateForUser(user.id);
    return {
        session_id: session.id,
        user_id: user.id,
        created_at: session.created_at.toISOString(),
    };
}
export async function getSessionWithContext(sessionId) {
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
//# sourceMappingURL=session.service.js.map