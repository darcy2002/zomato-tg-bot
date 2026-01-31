/**
 * Config for the Telegram bot process.
 * Requires TELEGRAM_BOT_TOKEN. When GEMINI_CLI_PATH is set, replies use Gemini CLI; otherwise BACKEND_URL is required.
 */
import { config as appConfig } from "../config/index.js";
export function getTelegramConfig() {
    const token = appConfig.TELEGRAM_BOT_TOKEN;
    const backendUrl = appConfig.BACKEND_URL ?? null;
    const geminiCliPath = appConfig.GEMINI_CLI_PATH?.trim() || null;
    if (!token) {
        throw new Error("TELEGRAM_BOT_TOKEN is required to run the Telegram bot. Set it in .env");
    }
    if (!geminiCliPath && !backendUrl) {
        throw new Error("Set either GEMINI_CLI_PATH (e.g. gemini or npx) for Gemini CLI replies, or BACKEND_URL for the API backend.");
    }
    return { token, backendUrl, geminiCliPath };
}
//# sourceMappingURL=config.js.map