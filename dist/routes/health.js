import { getPool } from "../db/client.js";
export default async function healthRoutes(app) {
    app.get("/health", async (_request, reply) => {
        return reply.send({ status: "ok" });
    });
    app.get("/health/ready", async (_request, reply) => {
        try {
            const pool = getPool();
            await pool.query("SELECT 1");
            return reply.send({ status: "ok", db: "connected" });
        }
        catch (_e) {
            return reply.status(503).send({ status: "unhealthy", db: "disconnected" });
        }
    });
}
//# sourceMappingURL=health.js.map