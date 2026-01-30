import type { FastifySchema } from "fastify";

export const addItemBody = {
  type: "object",
  required: ["session_id", "restaurant_id", "item_id", "quantity"],
  properties: {
    session_id: { type: "string", format: "uuid" },
    restaurant_id: { type: "string" },
    item_id: { type: "string" },
    quantity: { type: "number" },
    customizations: { type: "array" },
  },
} as const;

export const updateItemParams = {
  type: "object",
  required: ["lineId"],
  properties: {
    lineId: { type: "string", format: "uuid" },
  },
} as const;

export const updateItemBody = {
  type: "object",
  required: ["session_id", "quantity"],
  properties: {
    session_id: { type: "string", format: "uuid" },
    quantity: { type: "number" },
  },
} as const;

export const cartResponse = {
  type: "object",
  properties: {
    cart_id: { type: "string" },
    restaurant_id: { type: "string" },
    items: { type: "array" },
    subtotal_cents: { type: "number" },
    currency: { type: "string" },
  },
} as const;

export const getCurrentCart: FastifySchema = {
  headers: {
    type: "object",
    properties: {
      "x-session-id": { type: "string" },
    },
  },
  response: { 200: cartResponse },
};

export const postCartItems: FastifySchema = {
  body: addItemBody,
  response: { 201: cartResponse },
};

export const patchCartItem: FastifySchema = {
  params: updateItemParams,
  body: updateItemBody,
  response: { 200: cartResponse },
};
