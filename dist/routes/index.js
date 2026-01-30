import sessionsRoutes from "./sessions.js";
import conversationRoutes from "./conversation.js";
import discoveryRoutes from "./discovery.js";
import cartsRoutes from "./carts.js";
import ordersRoutes from "./orders.js";
import healthRoutes from "./health.js";
import { config } from "../config/index.js";
export async function registerRoutes(app) {
    const prefix = config.API_PREFIX;
    await app.register(healthRoutes, { prefix: "" });
    await app.register(sessionsRoutes, { prefix });
    await app.register(conversationRoutes, { prefix });
    await app.register(discoveryRoutes, { prefix });
    await app.register(cartsRoutes, { prefix });
    await app.register(ordersRoutes, { prefix });
}
//# sourceMappingURL=index.js.map