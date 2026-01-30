/**
 * LLM-based intent recognition using OpenAI function calling.
 * Returns structured intent + resolved_params via tool call. Falls back to rule-based resolver on failure.
 */
import OpenAI from "openai";
import { config } from "../../config/index.js";
import type { ResolvedIntent, ConversationContext } from "./types.js";
import { INTENTS, type IntentName } from "./types.js";
import { resolve as resolveRuleBased } from "./resolver.js";

const VALID_INTENTS = new Set<string>(INTENTS);

const CLASSIFY_INTENT_TOOL: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name: "classify_intent",
    description:
      "Classify the user's intent for a food ordering assistant (Zomato). Use conversation context to fill restaurant_id, order_id, lat, lon when the user implies 'this restaurant' or 'my order' without saying the id.",
    parameters: {
      type: "object",
      properties: {
        intent: {
          type: "string",
          enum: [...INTENTS],
          description:
            "One of: discover_restaurants, view_menu, add_to_cart, view_cart, update_cart_item, clear_cart, place_order, track_order, fallback",
        },
        confidence: {
          type: "number",
          minimum: 0,
          maximum: 1,
          description: "Confidence in the classification (0-1)",
        },
        resolved_params: {
          type: "object",
          description:
            "Extracted parameters: query (food/cuisine/location), lat, lon, restaurant_id, item_name, quantity, order_id, line_id as needed for the intent",
          properties: {
            query: { type: "string" },
            lat: { type: "number" },
            lon: { type: "number" },
            restaurant_id: { type: "string" },
            item_name: { type: "string" },
            quantity: { type: "number" },
            order_id: { type: "string" },
            line_id: { type: "string" },
          },
          additionalProperties: true,
        },
      },
      required: ["intent", "confidence", "resolved_params"],
    },
  },
};

function parseFunctionArguments(args: string): ResolvedIntent | null {
  try {
    const parsed = JSON.parse(args) as {
      intent?: string;
      confidence?: number;
      resolved_params?: Record<string, unknown>;
    };
    const name = parsed.intent?.trim();
    if (!name || !VALID_INTENTS.has(name)) return null;
    const confidence =
      typeof parsed.confidence === "number"
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0.9;
    const resolved_params =
      parsed.resolved_params && typeof parsed.resolved_params === "object"
        ? parsed.resolved_params
        : {};
    return {
      name: name as IntentName,
      confidence,
      resolved_params,
    };
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `You are an intent classifier for a food ordering assistant (Zomato). Given the user message and conversation context, call the classify_intent function with the detected intent and extracted parameters.

Intent meanings:
- discover_restaurants — User wants to find/search restaurants (e.g. "biryani near me", "pizza in Connaught Place"). resolved_params: query (food/cuisine/location), lat, lon if known.
- view_menu — User wants to see a restaurant's menu. resolved_params: restaurant_id (use context.last_restaurant_id if user says "menu" or "show menu" without naming a place).
- add_to_cart — User wants to add item(s) to cart (e.g. "add 2 biryani", "I'll take a pizza"). resolved_params: item_name, quantity (default 1), restaurant_id from context if available.
- view_cart — User wants to see current cart (e.g. "what's in my cart", "show cart").
- update_cart_item — User wants to change quantity or remove a line. resolved_params: line_id if mentioned, quantity (0 = remove).
- clear_cart — User wants to empty the cart (e.g. "clear cart", "remove all").
- place_order — User wants to place/confirm order (e.g. "place order", "checkout", "confirm").
- track_order — User wants order status (e.g. "where is my order"). resolved_params: order_id from context.active_order_id if not specified.
- fallback — Unclear or off-topic; use when none of the above fit. resolved_params: {}.`;

function buildUserMessage(message: string, context: ConversationContext): string {
  const ctx: Record<string, unknown> = {
    last_restaurant_id: context.last_restaurant_id ?? null,
    cart_item_count: context.cart_item_count ?? 0,
    active_order_id: context.active_order_id ?? null,
    default_lat: context.default_lat ?? null,
    default_lon: context.default_lon ?? null,
  };
  return `Context: ${JSON.stringify(ctx)}\n\nUser message: "${message}"`;
}

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  const key = config.OPENAI_API_KEY;
  if (!key || key.length < 10) return null;
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: key });
  return openaiClient;
}

/**
 * Resolve intent from natural language using OpenAI function calling. Falls back to rule-based resolver if
 * OPENAI_API_KEY is unset, or if the API call fails / returns an invalid tool call.
 */
export async function resolveWithLLM(
  message: string,
  context: ConversationContext
): Promise<ResolvedIntent> {
  const normalized = message.trim();
  if (!normalized) {
    return { name: "fallback", confidence: 0, resolved_params: {} };
  }

  const client = getOpenAIClient();
  if (!client) {
    return resolveRuleBased(message, context);
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(normalized, context) },
      ],
      tools: [CLASSIFY_INTENT_TOOL],
      tool_choice: { type: "function", function: { name: "classify_intent" } },
      max_tokens: 256,
      temperature: 0.1,
    });

    const choice = completion.choices[0];
    const toolCalls = choice?.message?.tool_calls;
    const fnCall = toolCalls?.[0];
    if (
      fnCall?.type === "function" &&
      fnCall.function?.name === "classify_intent" &&
      fnCall.function.arguments
    ) {
      const resolved = parseFunctionArguments(fnCall.function.arguments);
      if (resolved) return resolved;
    }
  } catch (_err) {
    // Fall through to rule-based
  }

  return resolveRuleBased(message, context);
}
