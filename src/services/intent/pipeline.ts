/**
 * Intent pipeline: load context -> resolve intent -> execute action -> format reply.
 * Used by conversation message and execute endpoints.
 */
import * as conversationStateRepo from "../../db/repositories/conversation_state.js";
import * as cartsRepo from "../../db/repositories/carts.js";
import * as ordersRepo from "../../db/repositories/orders.js";
import { resolveWithLLM } from "./llm-resolver.js";
import type { ConversationContext, ResolvedIntent, SuggestedAction } from "./types.js";

export interface PipelineInput {
  sessionId: string;
  message?: string;
  action?: string;
  params?: Record<string, unknown>;
}

export interface PipelineOutput {
  reply: { text: string; type: "text" };
  intent: ResolvedIntent;
  data?: Record<string, unknown>;
  suggested_actions: SuggestedAction[];
  context_updated: boolean;
}

export async function loadContext(sessionId: string): Promise<ConversationContext> {
  const [state, cart, ordersList] = await Promise.all([
    conversationStateRepo.get(sessionId),
    cartsRepo.getBySessionId(sessionId),
    ordersRepo.listBySessionId(sessionId, 1, 0),
  ]);
  const st = (state?.state ?? {}) as Record<string, unknown>;
  return {
    last_restaurant_id: st.last_restaurant_id as string | undefined,
    last_menu_at: st.last_menu_at as string | undefined,
    cart_item_count: cart?.items_snapshot?.length ?? 0,
    active_order_id: ordersList.orders[0]?.id,
    default_lat: st.default_lat as number | undefined,
    default_lon: st.default_lon as number | undefined,
  };
}

export async function resolveIntent(
  message: string | undefined,
  action: string | undefined,
  params: Record<string, unknown> | undefined,
  context: ConversationContext
): Promise<ResolvedIntent> {
  if (action && params) {
    return {
      name: action as ResolvedIntent["name"],
      confidence: 1,
      resolved_params: params,
    };
  }
  if (message) return resolveWithLLM(message, context);
  return { name: "fallback", confidence: 0, resolved_params: {} };
}

export async function runPipeline(input: PipelineInput): Promise<PipelineOutput> {
  const context = await loadContext(input.sessionId);
  const intent = await resolveIntent(
    input.message,
    input.action,
    input.params,
    context
  );

  // Default reply and suggestions; handlers can override
  let reply: PipelineOutput["reply"] = {
    text: "I didn’t understand. You can ask for restaurants, view menu, add to cart, or place order.",
    type: "text",
  };
  let data: Record<string, unknown> | undefined;
  const suggested_actions: SuggestedAction[] = [];
  let context_updated = false;

  // Dispatch to service layer (stub here; full impl in conversation route that calls discovery/cart/order services)
  switch (intent.name) {
    case "discover_restaurants":
      reply = { text: "Searching for restaurants…", type: "text" };
      suggested_actions.push({
        id: "discover_more",
        label: "Search restaurants",
        action: "discover_restaurants",
        params: { query: intent.resolved_params.query ?? "food" },
      });
      break;
    case "view_menu":
      if (intent.resolved_params.restaurant_id) {
        suggested_actions.push({
          id: `view_menu_${intent.resolved_params.restaurant_id}`,
          label: "View menu",
          action: "view_menu",
          params: { restaurant_id: intent.resolved_params.restaurant_id },
        });
      }
      reply = { text: "Here’s the menu.", type: "text" };
      break;
    case "view_cart":
      reply = { text: "Here’s your cart.", type: "text" };
      break;
    case "place_order":
      reply = { text: "Place your order when ready.", type: "text" };
      suggested_actions.push({ id: "place_order", label: "Place order", action: "place_order", params: {} });
      break;
    case "track_order":
      reply = { text: "Checking order status…", type: "text" };
      break;
    default:
      break;
  }

  return {
    reply,
    intent,
    data,
    suggested_actions,
    context_updated,
  };
}
