import type { FastifySchema } from "fastify";

export const placeOrderBody = {
  type: "object",
  required: ["session_id", "delivery_address"],
  properties: {
    session_id: { type: "string", format: "uuid" },
    idempotency_key: { type: "string" },
    delivery_address: {
      type: "object",
      required: ["city", "pin"],
      properties: {
        street: { type: "string" },
        city: { type: "string" },
        pin: { type: "string" },
        instructions: { type: "string" },
      },
    },
  },
} as const;

export const placeOrder: FastifySchema = {
  body: placeOrderBody,
  response: {
    201: {
      type: "object",
      properties: {
        order_id: { type: "string" },
        zomato_order_id: { type: ["string", "null"] },
        status: { type: "string" },
        estimated_delivery_at: { type: ["string", "null"] },
      },
    },
  },
};

export const getOrderParams = {
  type: "object",
  required: ["orderId"],
  properties: {
    orderId: { type: "string", format: "uuid" },
  },
} as const;

export const getOrder: FastifySchema = {
  params: getOrderParams,
  headers: {
    type: "object",
    properties: {
      "x-session-id": { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        order_id: { type: "string" },
        zomato_order_id: { type: "string" },
        status: { type: "string" },
        items: { type: "array" },
        tracking_url: { type: ["string", "null"] },
      },
    },
  },
};

export const listOrdersQuerystring = {
  type: "object",
  properties: {
    limit: { type: "number" },
    offset: { type: "number" },
  },
} as const;

export const listOrders: FastifySchema = {
  querystring: listOrdersQuerystring,
  headers: {
    type: "object",
    properties: {
      "x-session-id": { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        orders: { type: "array" },
        total: { type: "number" },
      },
    },
  },
};
