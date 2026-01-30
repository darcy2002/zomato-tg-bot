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
};
export class AppError extends Error {
    code;
    statusCode;
    details;
    constructor(code, message, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = "AppError";
    }
}
export function formatErrorResponse(code, message, requestId, details) {
    return {
        error: { code, message, ...(details?.length ? { details } : {}) },
        request_id: requestId,
    };
}
//# sourceMappingURL=errors.js.map