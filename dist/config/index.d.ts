/**
 * Application config from env. Validate on load.
 */
import { z } from "zod";
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    API_PREFIX: z.ZodDefault<z.ZodString>;
    DATABASE_URL: z.ZodString;
    ZOMATO_MCP_URL: z.ZodOptional<z.ZodString>;
    API_KEY: z.ZodOptional<z.ZodString>;
    OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
    TELEGRAM_BOT_TOKEN: z.ZodOptional<z.ZodString>;
    BACKEND_URL: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    API_PREFIX: string;
    DATABASE_URL: string;
    ZOMATO_MCP_URL?: string | undefined;
    API_KEY?: string | undefined;
    OPENAI_API_KEY?: string | undefined;
    TELEGRAM_BOT_TOKEN?: string | undefined;
    BACKEND_URL?: string | undefined;
}, {
    DATABASE_URL: string;
    NODE_ENV?: "development" | "test" | "production" | undefined;
    PORT?: number | undefined;
    API_PREFIX?: string | undefined;
    ZOMATO_MCP_URL?: string | undefined;
    API_KEY?: string | undefined;
    OPENAI_API_KEY?: string | undefined;
    TELEGRAM_BOT_TOKEN?: string | undefined;
    BACKEND_URL?: string | undefined;
}>;
export type Config = z.infer<typeof envSchema>;
export declare function loadConfig(): Config;
export declare const config: {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    API_PREFIX: string;
    DATABASE_URL: string;
    ZOMATO_MCP_URL?: string | undefined;
    API_KEY?: string | undefined;
    OPENAI_API_KEY?: string | undefined;
    TELEGRAM_BOT_TOKEN?: string | undefined;
    BACKEND_URL?: string | undefined;
};
export {};
//# sourceMappingURL=index.d.ts.map