/**
 * Config for the Telegram bot process. Requires TELEGRAM_BOT_TOKEN and BACKEND_URL.
 */
import { config as appConfig } from "../config/index.js";

export function getTelegramConfig(): { token: string; backendUrl: string } {
  const token = appConfig.TELEGRAM_BOT_TOKEN;
  const backendUrl = appConfig.BACKEND_URL;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is required to run the Telegram bot. Set it in .env");
  }
  if (!backendUrl) {
    throw new Error("BACKEND_URL is required to run the Telegram bot (e.g. http://localhost:3000). Set it in .env");
  }
  return { token, backendUrl };
}
