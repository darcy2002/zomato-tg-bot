/**
 * API-first Zomato food ordering backend.
 * Entry: start Fastify, register routes, listen.
 */
import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config/index.js";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import { closePool } from "./db/client.js";
async function main() {
    const app = Fastify({ logger: config.NODE_ENV !== "test" });
    app.setErrorHandler(errorHandler);
    await app.register(cors, { origin: true });
    await registerRoutes(app);
    try {
        await app.listen({ port: config.PORT, host: "0.0.0.0" });
        console.log(`Server listening on http://0.0.0.0:${config.PORT}`);
        console.log(`API prefix: ${config.API_PREFIX}`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
    const shutdown = async () => {
        await app.close();
        await closePool();
        process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}
main();
//# sourceMappingURL=index.js.map