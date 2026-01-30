import type { FastifyInstance } from "fastify";
import { runPipeline } from "../services/intent/pipeline.js";
import { postMessage, postExecute } from "../schemas/conversation.js";
import * as discoveryService from "../services/discovery.service.js";
import * as cartService from "../services/cart.service.js";
import { AppError, ErrorCodes } from "../lib/errors.js";
import * as sessionsRepo from "../db/repositories/sessions.js";

export default async function conversationRoutes(app: FastifyInstance) {
  app.post<{
    Body: { session_id: string; message: string };
  }>("/conversation/message", { schema: postMessage }, async (request, reply) => {
    const { session_id, message } = request.body;
    const session = await sessionsRepo.getById(session_id);
    if (!session) throw new AppError(ErrorCodes.SESSION_NOT_FOUND, "Session not found", 404);

    const pipelineResult = await runPipeline({ sessionId: session_id, message });
    const intent = pipelineResult.intent;

    let data: Record<string, unknown> | undefined;
    let replyText = pipelineResult.reply.text;
    const suggested_actions = [...pipelineResult.suggested_actions];

    if (intent.name === "discover_restaurants") {
      const query = (intent.resolved_params.query as string) ?? "food";
      const lat = (intent.resolved_params.lat as number) ?? 28.6139;
      const lon = (intent.resolved_params.lon as number) ?? 77.209;
      try {
        const result = await discoveryService.searchRestaurants({
          session_id,
          query,
          lat,
          lon,
          limit: 5,
        });
        data = { restaurants: result.restaurants };
        replyText =
          result.restaurants?.length > 0
            ? `Found ${result.restaurants.length} restaurants.`
            : "No restaurants found.";
        result.restaurants?.slice(0, 5).forEach((r: { id: string; name: string }) => {
          suggested_actions.push({
            id: `view_menu_${r.id}`,
            label: `View menu: ${r.name}`,
            action: "view_menu",
            params: { restaurant_id: r.id },
          });
        });
      } catch (_e) {
        replyText = "Sorry, I couldn’t search restaurants right now.";
      }
    } else if (intent.name === "view_menu" && intent.resolved_params.restaurant_id) {
      try {
        const menuResult = await discoveryService.getRestaurantMenu(
          session_id,
          intent.resolved_params.restaurant_id as string
        );
        data = { menu: menuResult };
        replyText = `Menu for ${menuResult.restaurant.name}.`;
      } catch (_e) {
        replyText = "Could not load menu.";
      }
    } else if (intent.name === "view_cart") {
      const cart = await cartService.getCurrentCart(session_id);
      data = cart ? { cart } : undefined;
      replyText = cart ? "Here’s your cart." : "Your cart is empty.";
      if (cart) {
        suggested_actions.push({ id: "place_order", label: "Place order", action: "place_order", params: {} });
      }
    }

    return reply.send({
      reply: { text: replyText, type: "text" },
      intent: pipelineResult.intent,
      data,
      suggested_actions,
      context_updated: pipelineResult.context_updated,
    });
  });

  app.post<{
    Body: { session_id: string; action: string; params?: Record<string, unknown> };
  }>("/conversation/execute", { schema: postExecute }, async (request, reply) => {
    const { session_id, action, params = {} } = request.body;
    const session = await sessionsRepo.getById(session_id);
    if (!session) throw new AppError(ErrorCodes.SESSION_NOT_FOUND, "Session not found", 404);

    const pipelineResult = await runPipeline({
      sessionId: session_id,
      action,
      params,
    });
    let data: Record<string, unknown> | undefined;
    let replyText = pipelineResult.reply.text;

    if (action === "view_menu" && params.restaurant_id) {
      try {
        const menuResult = await discoveryService.getRestaurantMenu(
          session_id,
          params.restaurant_id as string
        );
        data = { menu: menuResult };
        replyText = `Menu for ${menuResult.restaurant.name}.`;
      } catch (_e) {
        replyText = "Could not load menu.";
      }
    }

    return reply.send({
      reply: { text: replyText, type: "text" },
      intent: pipelineResult.intent,
      data,
      suggested_actions: pipelineResult.suggested_actions,
      context_updated: pipelineResult.context_updated,
    });
  });
}
