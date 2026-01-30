/**
 * Application error codes and formatter for consistent API error responses.
 */
export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
  CART_NOT_FOUND: "CART_NOT_FOUND",
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  MCP_ERROR: "MCP_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export interface ErrorDetail {
  path?: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: ErrorDetail[]
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function formatErrorResponse(
  code: ErrorCode,
  message: string,
  requestId: string,
  details?: ErrorDetail[]
) {
  return {
    error: { code, message, ...(details?.length ? { details } : {}) },
    request_id: requestId,
  };
}
