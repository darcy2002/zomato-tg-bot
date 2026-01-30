import type { FastifyInstance } from "fastify";
import * as discoveryService from "../services/discovery.service.js";
import { searchRestaurants, getMenu } from "../schemas/discovery.js";
import { AppError, ErrorCodes } from "../lib/errors.js";
import * as sessionsRepo from "../db/repositories/sessions.js";

export default async function discoveryRoutes(app: FastifyInstance) {
  app.post<{
    Body: {
      session_id: string;
      query?: string;
      lat: number;
      lon: number;
      limit?: number;
      offset?: number;
    };
  }>("/discovery/restaurants", { schema: searchRestaurants }, async (request, reply) => {
    const session = await sessionsRepo.getById(request.body.session_id);
    if (!session) throw new AppError(ErrorCodes.SESSION_NOT_FOUND, "Session not found", 404);
    const result = await discoveryService.searchRestaurants(request.body);
    return reply.send(result);
  });

  app.get<{ Params: { restaurantId: string }; Headers: { "x-session-id"?: string } }>(
    "/discovery/restaurants/:restaurantId/menu",
    { schema: getMenu },
    async (request, reply) => {
      const sessionId = request.headers["x-session-id"];
      if (!sessionId) throw new AppError(ErrorCodes.UNAUTHORIZED, "X-Session-Id required", 401);
      const session = await sessionsRepo.getById(sessionId);
      if (!session) throw new AppError(ErrorCodes.SESSION_NOT_FOUND, "Session not found", 404);
      const result = await discoveryService.getRestaurantMenu(
        sessionId,
        request.params.restaurantId
      );
      return reply.send(result);
    }
  );
}
