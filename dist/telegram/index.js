/**
 * Telegram bot entry. Run with: npm run dev:telegram or npm run telegram
 * Requires: TELEGRAM_BOT_TOKEN; and either GEMINI_CLI_PATH or BACKEND_URL.
 */
import "dotenv/config";
import { getTelegramConfig } from "./config.js";
import { getGeminiSession, stopGeminiSession } from "./gemini-session.js";
import { bot } from "./bot.js";
async function main() {
    const { geminiCliPath } = getTelegramConfig();
    if (geminiCliPath) {
        getGeminiSession({ cliPath: geminiCliPath });
        console.log("Gemini CLI session started (single persistent process).");
    }
    try {
        await bot.launch();
        console.log("Telegram bot is running (long polling).");
    }
    catch (err) {
        console.error("Failed to start Telegram bot:", err);
        process.exit(1);
    }
    const shutdown = (signal) => {
        stopGeminiSession();
        bot.stop(signal);
    };
    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
}
main();
//# sourceMappingURL=index.js.map