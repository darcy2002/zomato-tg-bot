import * as orderService from "../services/order.service.js";
import { placeOrder, getOrder, listOrders } from "../schemas/orders.js";
import { AppError, ErrorCodes } from "../lib/errors.js";
import * as sessionsRepo from "../db/repositories/sessions.js";
export default async function ordersRoutes(app) {
    app.post("/orders", { schema: placeOrder }, async (request, reply) => {
        const { session_id, idempotency_key, delivery_address } = request.body;
        const session = await sessionsRepo.getById(session_id);
        if (!session)
            throw new AppError(ErrorCodes.SESSION_NOT_FOUND, "Session not found", 404);
        const result = await orderService.placeOrder({
            session_id,
            user_id: session.user_id,
            idempotency_key,
            delivery_address,
        });
        return reply.status(201).send(result);
    });
    app.get("/orders/:orderId", { schema: getOrder }, async (request, reply) => {
        const sessionId = request.headers["x-session-id"];
        if (!sessionId)
            throw new AppError(ErrorCodes.UNAUTHORIZED, "X-Session-Id required", 401);
        const session = await sessionsRepo.getById(sessionId);
        if (!session)
            throw new AppError(ErrorCodes.SESSION_NOT_FOUND, "Session not found", 404);
        const result = await orderService.getOrderStatus(sessionId, request.params.orderId);
        return reply.send(result);
    });
    app.get("/orders", { schema: listOrders }, async (request, reply) => {
        const sessionId = request.headers["x-session-id"];
        if (!sessionId)
            throw new AppError(ErrorCodes.UNAUTHORIZED, "X-Session-Id required", 401);
        const session = await sessionsRepo.getById(sessionId);
        if (!session)
            throw new AppError(ErrorCodes.SESSION_NOT_FOUND, "Session not found", 404);
        const limit = request.query.limit ?? 10;
        const offset = request.query.offset ?? 0;
        const result = await orderService.listOrders(sessionId, limit, offset);
        return reply.send(result);
    });
}
//# sourceMappingURL=orders.js.map