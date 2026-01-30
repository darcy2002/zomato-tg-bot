import type { FastifySchema } from "fastify";

export const searchRestaurantsBody = {
  type: "object",
  required: ["session_id", "lat", "lon"],
  properties: {
    session_id: { type: "string", format: "uuid" },
    query: { type: "string" },
    lat: { type: "number" },
    lon: { type: "number" },
    limit: { type: "number" },
    offset: { type: "number" },
  },
} as const;

export const searchRestaurants: FastifySchema = {
  body: searchRestaurantsBody,
  response: {
    200: {
      type: "object",
      properties: {
        restaurants: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              cuisine: { type: "string" },
              rating: { type: "number" },
              delivery_time_min: { type: "number" },
              address: { type: "string" },
            },
          },
        },
        total: { type: "number" },
      },
    },
  },
};

export const getMenuParams = {
  type: "object",
  required: ["restaurantId"],
  properties: {
    restaurantId: { type: "string" },
  },
} as const;

export const getMenu: FastifySchema = {
  params: getMenuParams,
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
        restaurant: { type: "object", properties: { id: { type: "string" }, name: { type: "string" } } },
        categories: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    price: { type: "number" },
                    currency: { type: "string" },
                    description: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
