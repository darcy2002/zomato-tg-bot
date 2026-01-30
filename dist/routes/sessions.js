import * as sessionService from "../services/session.service.js";
import { createSession, getSession } from "../schemas/sessions.js";
export default async function sessionsRoutes(app) {
    app.post("/sessions", { schema: createSession }, async (request, reply) => {
        const result = await sessionService.createOrGetSession(request.body);
        return reply.status(201).send(result);
    });
    app.get("/sessions/:sessionId", { schema: getSession }, async (request, reply) => {
        const result = await sessionService.getSessionWithContext(request.params.sessionId);
        return reply.send(result);
    });
}
//# sourceMappingURL=sessions.js.map