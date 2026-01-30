/**
 * Telegraf bot: receives messages and callbacks, calls backend API, sends replies and keyboards.
 */
import { Telegraf, Markup } from "telegraf";
import { getTelegramConfig } from "./config.js";
import { createApiClient, BackendApiError } from "./api-client.js";
import { storeCallback, getCallback, deleteCallback } from "./callback-store.js";
const { token, backendUrl } = getTelegramConfig();
const api = createApiClient(backendUrl);
const bot = new Telegraf(token);
function buildInlineKeyboard(suggestedActions, sessionId) {
    if (!suggestedActions.length)
        return undefined;
    const buttons = suggestedActions.slice(0, 8).map((sa) => {
        const callbackId = storeCallback({
            session_id: sessionId,
            action: sa.action,
            params: sa.params ?? {},
        });
        return Markup.button.callback(sa.label, callbackId);
    });
    const rows = [];
    for (let i = 0; i < buttons.length; i += 2) {
        rows.push(buttons.slice(i, i + 2));
    }
    return Markup.inlineKeyboard(rows);
}
async function sendConversationReply(ctx, replyText, suggestedActions, sessionId) {
    const keyboard = buildInlineKeyboard(suggestedActions, sessionId);
    if (keyboard) {
        return ctx.reply(replyText, keyboard);
    }
    return ctx.reply(replyText);
}
bot.on("message", async (ctx) => {
    const text = "text" in ctx.message ? ctx.message.text?.trim() : null;
    if (!text) {
        await ctx.reply("Send me a text message to search for food, view menu, add to cart, or place an order.");
        return;
    }
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId)
        return;
    try {
        const session = await api.createOrGetSession("telegram", String(telegramUserId));
        const response = await api.sendMessage(session.session_id, text);
        await sendConversationReply(ctx, response.reply.text, response.suggested_actions ?? [], session.session_id);
    }
    catch (err) {
        if (err instanceof BackendApiError) {
            await ctx.reply("Something went wrong. Please try again.");
            return;
        }
        console.error("Telegram bot error:", err);
        await ctx.reply("Something went wrong. Please try again.");
    }
});
bot.on("callback_query", async (ctx) => {
    const callbackId = "data" in ctx.callbackQuery ? ctx.callbackQuery.data : null;
    if (!callbackId) {
        await ctx.answerCbQuery();
        return;
    }
    const payload = getCallback(callbackId);
    deleteCallback(callbackId);
    if (!payload) {
        await ctx.answerCbQuery("This action expired. Send a new message.");
        return;
    }
    try {
        const response = await api.executeAction(payload.session_id, payload.action, payload.params);
        await ctx.answerCbQuery();
        const keyboard = buildInlineKeyboard(response.suggested_actions ?? [], payload.session_id);
        if (keyboard) {
            await ctx.reply(response.reply.text, keyboard);
        }
        else {
            await ctx.reply(response.reply.text);
        }
    }
    catch (err) {
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
//# sourceMappingURL=bot.js.map