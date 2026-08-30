// =====================================
// ..M MioBot
// Telegram Auto Mio Bot
// File: bot.js
// =====================================

import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";

const TOKEN = process.env.BOT_TOKEN;

// 5 دقیقه و 20 ثانیه
const MIO_INTERVAL = 5 * 60 * 1000 + 20 * 1000;

if (!TOKEN) {
    console.error("❌ BOT_TOKEN is not configured.");
    process.exit(1);
}

const bot = new TelegramBot(TOKEN, {
    polling: true
});

// گروه‌هایی که ربات در آن‌ها فعال شده
const activeGroups = new Map();

console.log("=====================================");
console.log("🐱 ..M MioBot");
console.log("⏱️ Interval: 5 minutes 20 seconds");
console.log("🚀 Bot started successfully");
console.log("=====================================");


// =====================================
// START MIO
// =====================================

bot.onText(/^\/startmio(?:@\w+)?$/i, async (msg) => {

    const chatId = msg.chat.id;

    // فقط گروه و سوپرگروه
    if (
        msg.chat.type !== "group" &&
        msg.chat.type !== "supergroup"
    ) {
        await bot.sendMessage(
            chatId,
            "❌ این دستور فقط داخل گروه قابل استفاده است."
        );

        return;
    }

    // اگر قبلاً فعال بوده
    if (activeGroups.has(chatId)) {

        await bot.sendMessage(
            chatId,
            "🐱 ربات میو از قبل فعاله."
        );

        return;
    }

    console.log(`✅ Mio activated for group: ${chatId}`);

    await bot.sendMessage(
        chatId,
        "🐱 میو فعال شد!\n⏱️ هر ۵ دقیقه و ۲۰ ثانیه یک میو."
    );

    // اولین میو بعد از 5:20
    const timer = setInterval(async () => {

        await sendMio(chatId);

    }, MIO_INTERVAL);

    activeGroups.set(chatId, timer);
});


// =====================================
// STOP MIO
// =====================================

bot.onText(/^\/stopmio(?:@\w+)?$/i, async (msg) => {

    const chatId = msg.chat.id;

    if (
        msg.chat.type !== "group" &&
        msg.chat.type !== "supergroup"
    ) {
        return;
    }

    const timer = activeGroups.get(chatId);

    if (!timer) {

        await bot.sendMessage(
            chatId,
            "🐱 ربات میو در این گروه فعال نیست."
        );

        return;
    }

    clearInterval(timer);

    activeGroups.delete(chatId);

    console.log(`🛑 Mio stopped for group: ${chatId}`);

    await bot.sendMessage(
        chatId,
        "🛑 میو متوقف شد."
    );
});


// =====================================
// SEND MIO
// =====================================

async function sendMio(chatId) {

    try {

        await bot.sendMessage(
            chatId,
            "میو 🐱"
        );

        console.log(
            `🐱 Mio sent | Group: ${chatId} | ${new Date().toISOString()}`
        );

    } catch (error) {

        console.error(
            `❌ Failed to send Mio | Group: ${chatId}`,
            error.message
        );

        // اگر ربات از گروه حذف شده باشد
        // تایمر را متوقف می‌کنیم
        if (
            error.message.includes("chat not found") ||
            error.message.includes("bot was kicked") ||
            error.message.includes("Forbidden")
        ) {

            const timer = activeGroups.get(chatId);

            if (timer) {
                clearInterval(timer);
                activeGroups.delete(chatId);
            }
        }
    }
}


// =====================================
// TELEGRAM ERRORS
// =====================================

bot.on("polling_error", (error) => {

    console.error(
        "❌ Telegram polling error:",
        error.message
    );

});


// =====================================
// PROCESS SHUTDOWN
// =====================================

function shutdown(signal) {

    console.log(`🛑 Received ${signal}`);

    for (const timer of activeGroups.values()) {
        clearInterval(timer);
    }

    activeGroups.clear();

    bot.stopPolling();

    process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));