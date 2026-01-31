/**
 * Telegram bot entry. Run with: npm run dev:telegram or npm run telegram
 * Requires: TELEGRAM_BOT_TOKEN; and either GEMINI_CLI_PATH or BACKEND_URL.
 * When GEMINI_CLI_PATH is set, uses one-shot Gemini CLI with conversation history in each prompt.
 */
import "dotenv/config";
import { getTelegramConfig } from "./config.js";
import { bot } from "./bot.js";

async function main() {
  const { geminiCliPath } = getTelegramConfig();
  if (geminiCliPath) {
    console.log("Gemini CLI: one-shot mode (conversation context in each prompt).");
  }
  try {
    await bot.launch();
    console.log("Telegram bot is running (long polling).");
  } catch (err) {
    console.error("Failed to start Telegram bot:", err);
    process.exit(1);
  }

  const shutdown = (signal: string) => {
    bot.stop(signal);
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

main();
