/**
 * Telegraf bot: receives messages and callbacks.
 * When GEMINI_CLI_PATH is set, text messages are sent to Gemini CLI and the reply is sent back.
 * Otherwise, calls backend API and sends replies with optional inline keyboards.
 */
import { Telegraf } from "telegraf";
import type { Context } from "telegraf";
declare const bot: Telegraf<Context<import("@telegraf/types").Update>>;
export { bot };
//# sourceMappingURL=bot.d.ts.map