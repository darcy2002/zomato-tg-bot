import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError, ErrorCodes, formatErrorResponse } from "../lib/errors.js";
import { randomUUID } from "crypto";

export function errorHandler(
  err: FastifyError | AppError,
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const requestId = randomUUID();
  if (err instanceof AppError) {
    reply.status(err.statusCode).send(
      formatErrorResponse(err.code, err.message, requestId, err.details)
    );
    return;
  }
  if (err.validation) {
    reply.status(400).send(
      formatErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        err.message,
        requestId,
        err.validation?.map((v) => ({ path: v.instancePath, message: v.message }))
      )
    );
    return;
  }
  reply.status(err.statusCode ?? 500).send(
    formatErrorResponse(ErrorCodes.INTERNAL_ERROR, "Internal server error", requestId)
  );
}
