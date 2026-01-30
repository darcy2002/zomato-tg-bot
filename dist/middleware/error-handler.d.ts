import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../lib/errors.js";
export declare function errorHandler(err: FastifyError | AppError, _request: FastifyRequest, reply: FastifyReply): void;
//# sourceMappingURL=error-handler.d.ts.map