import type { FastifyInstance } from "fastify";
import * as sessionService from "../services/session.service.js";
import { createSession, getSession } from "../schemas/sessions.js";

export default async function sessionsRoutes(app: FastifyInstance) {
  app.post<{
    Body: { channel: string; channel_user_id: string };
  }>("/sessions", { schema: createSession }, async (request, reply) => {
    const result = await sessionService.createOrGetSession(request.body);
    return reply.status(201).send(result);
  });

  app.get<{ Params: { sessionId: string } }>(
    "/sessions/:sessionId",
    { schema: getSession },
    async (request, reply) => {
      const result = await sessionService.getSessionWithContext(request.params.sessionId);
      return reply.send(result);
    }
  );
}
