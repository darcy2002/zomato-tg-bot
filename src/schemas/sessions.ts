import type { FastifySchema } from "fastify";

export const createSessionBody = {
  type: "object",
  required: ["channel", "channel_user_id"],
  properties: {
    channel: { type: "string", enum: ["telegram", "web"] },
    channel_user_id: { type: "string" },
  },
} as const;

export const createSession: FastifySchema = {
  body: createSessionBody,
  response: {
    201: {
      type: "object",
      properties: {
        session_id: { type: "string", format: "uuid" },
        user_id: { type: "string", format: "uuid" },
        created_at: { type: "string", format: "date-time" },
      },
    },
  },
};

export const getSessionParams = {
  type: "object",
  required: ["sessionId"],
  properties: {
    sessionId: { type: "string", format: "uuid" },
  },
} as const;

export const getSession: FastifySchema = {
  params: getSessionParams,
  response: {
    200: {
      type: "object",
      properties: {
        session_id: { type: "string" },
        user_id: { type: "string" },
        context: {
          type: "object",
          properties: {
            last_restaurant_id: { type: ["string", "null"] },
            cart_item_count: { type: "number" },
            active_order_id: { type: ["string", "null"] },
          },
        },
      },
    },
  },
};
