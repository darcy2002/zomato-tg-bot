/**
 * Telegram bot entry. Run with: npm run dev:telegram or npm run telegram
 * Requires: TELEGRAM_BOT_TOKEN, BACKEND_URL (API server must be running).
 */
import { bot } from "./bot.js";
async function main() {
    try {
        await bot.launch();
        console.log("Telegram bot is running (long polling).");
    }
    catch (err) {
        console.error("Failed to start Telegram bot:", err);
        process.exit(1);
    }
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
}
main();
//# sourceMappingURL=index.js.map