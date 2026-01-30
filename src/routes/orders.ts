import type { FastifyInstance } from "fastify";
import * as orderService from "../services/order.service.js";
import { placeOrder, getOrder, listOrders } from "../schemas/orders.js";
import { AppError, ErrorCodes } from "../lib/errors.js";
import * as sessionsRepo from "../db/repositories/sessions.js";

export default async function ordersRoutes(app: FastifyInstance) {
  app.post<{
    Body: {
      session_id: string;
      idempotency_key?: string;
      delivery_address: { street?: string; city: string; pin: string; instructions?: string };
    };
  }>("/orders", { schema: placeOrder }, async (request, reply) => {
    const { session_id, idempotency_key, delivery_address } = request.body;
    const session = await sessionsRepo.getById(session_id);
    if (!session) throw new AppError(ErrorCodes.SESSION_NOT_FOUND, "Session not found", 404);
    const result = await orderService.placeOrder({
      session_id,
      user_id: session.user_id,
      idempotency_key,
      delivery_address,
    });
    return reply.status(201).send(result);
  });

  app.get<{
    Params: { orderId: string };
    Headers: { "x-session-id"?: string };
  }>("/orders/:orderId", { schema: getOrder }, async (request, reply) => {
    const sessionId = request.headers["x-session-id"];
    if (!sessionId) throw new AppError(ErrorCodes.UNAUTHORIZED, "X-Session-Id required", 401);
    const session = await sessionsRepo.getById(sessionId);
    if (!session) throw new AppError(ErrorCodes.SESSION_NOT_FOUND, "Session not found", 404);
    const result = await orderService.getOrderStatus(sessionId, request.params.orderId);
    return reply.send(result);
  });

  app.get<{
    Querystring: { limit?: number; offset?: number };
    Headers: { "x-session-id"?: string };
  }>("/orders", { schema: listOrders }, async (request, reply) => {
    const sessionId = request.headers["x-session-id"];
    if (!sessionId) throw new AppError(ErrorCodes.UNAUTHORIZED, "X-Session-Id required", 401);
    const session = await sessionsRepo.getById(sessionId);
    if (!session) throw new AppError(ErrorCodes.SESSION_NOT_FOUND, "Session not found", 404);
    const limit = request.query.limit ?? 10;
    const offset = request.query.offset ?? 0;
    const result = await orderService.listOrders(sessionId, limit, offset);
    return reply.send(result);
  });
}
