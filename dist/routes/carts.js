import * as cartService from "../services/cart.service.js";
import { getCurrentCart, postCartItems, patchCartItem } from "../schemas/carts.js";
import { AppError, ErrorCodes } from "../lib/errors.js";
import * as sessionsRepo from "../db/repositories/sessions.js";
export default async function cartsRoutes(app) {
    app.get("/carts/current", { schema: getCurrentCart }, async (request, reply) => {
        const sessionId = request.headers["x-session-id"];
        if (!sessionId)
            throw new AppError(ErrorCodes.UNAUTHORIZED, "X-Session-Id required", 401);
        const session = await sessionsRepo.getById(sessionId);
        if (!session)
            throw new AppError(ErrorCodes.SESSION_NOT_FOUND, "Session not found", 404);
        const cart = await cartService.getCurrentCart(sessionId);
        if (!cart)
            return reply.status(204).send();
        return reply.send(cart);
    });
    app.post("/carts/items", { schema: postCartItems }, async (request, reply) => {
        const session = await sessionsRepo.getById(request.body.session_id);
        if (!session)
            throw new AppError(ErrorCodes.SESSION_NOT_FOUND, "Session not found", 404);
        const result = await cartService.addItem(request.body);
        return reply.status(201).send(result);
    });
    app.patch("/carts/items/:lineId", { schema: patchCartItem }, async (request, reply) => {
        const session = await sessionsRepo.getById(request.body.session_id);
        if (!session)
            throw new AppError(ErrorCodes.SESSION_NOT_FOUND, "Session not found", 404);
        // TODO: implement update line (quantity 0 = remove) and call MCP update_cart
        return reply.status(501).send({ error: "Update cart item not yet implemented" });
    });
    app.delete("/carts/current", async (request, reply) => {
        const sessionId = request.headers["x-session-id"];
        if (!sessionId)
            throw new AppError(ErrorCodes.UNAUTHORIZED, "X-Session-Id required", 401);
        const session = await sessionsRepo.getById(sessionId);
        if (!session)
            throw new AppError(ErrorCodes.SESSION_NOT_FOUND, "Session not found", 404);
        await cartService.clearCart(sessionId);
        return reply.status(204).send();
    });
}
//# sourceMappingURL=carts.js.map