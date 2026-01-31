/**
 * Telegraf bot: receives messages and callbacks.
 * When GEMINI_CLI_PATH is set, text messages are sent to Gemini CLI and the reply is sent back.
 * Otherwise, calls backend API and sends replies with optional inline keyboards.
 */
import { Telegraf, Markup } from "telegraf";
import type { Context } from "telegraf";
import { getTelegramConfig } from "./config.js";
import { createApiClient, BackendApiError } from "./api-client.js";
import {
  storeCallback,
  getCallback,
  deleteCallback,
} from "./callback-store.js";
import { runGeminiCli } from "./gemini-cli.js";
import {
  appendTurn,
  buildPromptWithHistory,
} from "./conversation-history.js";

const { token, backendUrl, geminiCliPath } = getTelegramConfig();
const api = backendUrl ? createApiClient(backendUrl) : null;

const bot = new Telegraf(token);

function buildInlineKeyboard(
  suggestedActions: {
    id: string;
    label: string;
    action: string;
    params: Record<string, unknown>;
  }[],
  sessionId: string,
) {
  if (!suggestedActions.length) return undefined;
  const buttons = suggestedActions.slice(0, 8).map((sa) => {
    const callbackId = storeCallback({
      session_id: sessionId,
      action: sa.action,
      params: sa.params ?? {},
    });
    return Markup.button.callback(sa.label, callbackId);
  });
  const rows: (typeof buttons)[] = [];
  for (let i = 0; i < buttons.length; i += 2) {
    rows.push(buttons.slice(i, i + 2));
  }
  return Markup.inlineKeyboard(rows);
}

async function sendConversationReply(
  ctx: Context,
  replyText: string,
  suggestedActions: {
    id: string;
    label: string;
    action: string;
    params: Record<string, unknown>;
  }[],
  sessionId: string,
) {
  const keyboard = buildInlineKeyboard(suggestedActions, sessionId);
  if (keyboard) {
    return ctx.reply(replyText, keyboard);
  }
  return ctx.reply(replyText);
}

bot.on("message", async (ctx) => {
  const raw =
    "text" in ctx.message
      ? ctx.message.text
      : "caption" in ctx.message
        ? ctx.message.caption
        : null;
  const text = typeof raw === "string" ? raw.trim() : null;
  if (!text) {
    await ctx.reply(
      "Send me a text message to search for food, view menu, add to cart, or place an order.",
    );
    return;
  }

  if (geminiCliPath) {
    const chatId = ctx.chat?.id;
    if (typeof chatId !== "number") {
      await ctx.reply("Something went wrong. Please try again.");
      return;
    }
    try {
      const statusMsg = await ctx.reply("Thinking…");
      // One-shot: full conversation context in the prompt so Gemini has context
      const fullPrompt = buildPromptWithHistory(chatId, text);
      const result = await runGeminiCli(fullPrompt, { cliPath: geminiCliPath });
      await ctx.telegram
        .deleteMessage(ctx.chat.id, statusMsg.message_id)
        .catch(() => {});
      if (result.ok) {
        appendTurn(chatId, "user", text);
        appendTurn(chatId, "assistant", result.response);
        await ctx.reply(result.response);
      } else {
        await ctx.reply(`Sorry, something went wrong: ${result.error}`);
      }
    } catch (err) {
      console.error("Gemini CLI error:", err);
      await ctx.reply("Something went wrong. Please try again.");
    }
    return;
  }

  const telegramUserId = ctx.from?.id;
  if (!telegramUserId || !api) return;

  try {
    const session = await api.createOrGetSession(
      "telegram",
      String(telegramUserId),
    );
    const response = await api.sendMessage(session.session_id, text);
    await sendConversationReply(
      ctx,
      response.reply.text,
      response.suggested_actions ?? [],
      session.session_id,
    );
  } catch (err) {
    if (err instanceof BackendApiError) {
      await ctx.reply("Something went wrong. Please try again.");
      return;
    }
    console.error("Telegram bot error:", err);
    await ctx.reply("Something went wrong. Please try again.");
  }
});

bot.on("callback_query", async (ctx) => {
  const callbackId =
    "data" in ctx.callbackQuery ? ctx.callbackQuery.data : null;
  if (!callbackId) {
    await ctx.answerCbQuery();
    return;
  }

  if (geminiCliPath) {
    await ctx.answerCbQuery("Please send a text message to chat.");
    return;
  }

  const payload = getCallback(callbackId);
  deleteCallback(callbackId);

  if (!payload) {
    await ctx.answerCbQuery("This action expired. Send a new message.");
    return;
  }

  if (!api) {
    await ctx.answerCbQuery("Something went wrong.");
    return;
  }

  try {
    const response = await api.executeAction(
      payload.session_id,
      payload.action,
      payload.params,
    );
    await ctx.answerCbQuery();
    const keyboard = buildInlineKeyboard(
      response.suggested_actions ?? [],
      payload.session_id,
    );
    if (keyboard) {
      await ctx.reply(response.reply.text, keyboard);
    } else {
      await ctx.reply(response.reply.text);
    }
  } catch (err) {
    await ctx.answerCbQuery("Something went wrong.");
    if (err instanceof BackendApiError) {
      await ctx.reply("Something went wrong. Please try again.");
      return;
    }
    console.error("Telegram bot callback error:", err);
    await ctx.reply("Something went wrong. Please try again.");
  }
});

export { bot };
