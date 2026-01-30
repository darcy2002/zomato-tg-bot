/**
 * Application error codes and formatter for consistent API error responses.
 */
export declare const ErrorCodes: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly SESSION_NOT_FOUND: "SESSION_NOT_FOUND";
    readonly CART_NOT_FOUND: "CART_NOT_FOUND";
    readonly ORDER_NOT_FOUND: "ORDER_NOT_FOUND";
    readonly MCP_ERROR: "MCP_ERROR";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
};
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
export interface ErrorDetail {
    path?: string;
    message: string;
}
export declare class AppError extends Error {
    readonly code: ErrorCode;
    readonly statusCode: number;
    readonly details?: ErrorDetail[] | undefined;
    constructor(code: ErrorCode, message: string, statusCode?: number, details?: ErrorDetail[] | undefined);
}
export declare function formatErrorResponse(code: ErrorCode, message: string, requestId: string, details?: ErrorDetail[]): {
    error: {
        details?: ErrorDetail[] | undefined;
        code: ErrorCode;
        message: string;
    };
    request_id: string;
};
//# sourceMappingURL=errors.d.ts.map