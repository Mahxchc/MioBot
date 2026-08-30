// =====================================
// ..M MioBot
// Telegram Private Auto Mio Bot
// File: bot.js
// =====================================

import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";

const TOKEN = process.env.BOT_TOKEN;

// =====================================
// ..M OWNER CONFIG
// =====================================

// فقط این حساب صاحب ربات است
const OWNER_USERNAME = "mehdi2410l";

// آیدی پشتیبانی
const SUPPORT_USERNAME = "mehdi2410l";


// =====================================
// ..M MIO CONFIG
// =====================================

// 5 دقیقه و 20 ثانیه
const MIO_INTERVAL = 5 * 60 * 1000 + 20 * 1000;


if (!TOKEN) {
    console.error("❌ BOT_TOKEN is not configured.");
    process.exit(1);
}


const bot = new TelegramBot(TOKEN, {
    polling: true
});


const activeGroups = new Map();


console.log("=====================================");
console.log("🐱 ..M MioBot");
console.log("🚀 Bot started successfully");
console.log("⏱️ Mio interval: 5 minutes 20 seconds");
console.log(`👑 Owner: @${OWNER_USERNAME}`);
console.log("=====================================");


// =====================================
// ..M CHECK OWNER
// =====================================

function isOwner(msg) {

    const username = msg?.from?.username;

    if (!username) {
        return false;
    }

    return username.toLowerCase() === OWNER_USERNAME.toLowerCase();
}


// =====================================
// ..M ACCESS DENIED
// =====================================

async function sendAccessDenied(chatId) {

    try {

        await bot.sendMessage(
            chatId,
            "⛔ دسترسی ندارید.\n\n" +
            "این ربات خصوصی است.\n" +
            "برای دریافت دسترسی لطفاً به پشتیبانی پیام دهید:\n\n" +
            `👉 @${SUPPORT_USERNAME}`
        );

    } catch (error) {

        console.error(
            "❌ Access denied message error:",
            error.message
        );

    }
}


// =====================================
// ..M START
// =====================================

bot.onText(/^\/start(?:@\w+)?$/i, async (msg) => {

    const chatId = msg.chat.id;


    // فقط صاحب ربات
    if (!isOwner(msg)) {

        await sendAccessDenied(chatId);

        return;
    }


    await bot.sendMessage(
        chatId,
        "🐱 سلام صاحب ربات!\n\n" +
        "✅ MioBot فعال است.\n\n" +
        "دستورات:\n" +
        "/startmio — شروع میو\n" +
        "/stopmio — توقف میو"
    );

});


// =====================================
// ..M START MIO
// =====================================

bot.onText(/^\/startmio(?:@\w+)?$/i, async (msg) => {

    const chatId = msg.chat.id;


    // بررسی مالک
    if (!isOwner(msg)) {

        await sendAccessDenied(chatId);

        return;
    }


    // فقط گروه
    if (
        msg.chat.type !== "group" &&
        msg.chat.type !== "supergroup"
    ) {

        await bot.sendMessage(
            chatId,
            "❌ دستور /startmio فقط داخل گروه قابل استفاده است."
        );

        return;
    }


    // اگر قبلاً فعال است
    if (activeGroups.has(chatId)) {

        await bot.sendMessage(
            chatId,
            "🐱 میو در این گروه از قبل فعال است."
        );

        return;
    }


    console.log(
        `✅ Mio activated | Group: ${chatId}`
    );


    await bot.sendMessage(
        chatId,
        "🐱 میو فعال شد!\n\n" +
        "⏱️ هر ۵ دقیقه و ۲۰ ثانیه یک میو ارسال می‌شود."
    );


    const timer = setInterval(
        async () => {

            await sendMio(chatId);

        },
        MIO_INTERVAL
    );


    activeGroups.set(
        chatId,
        timer
    );

});


// =====================================
// ..M STOP MIO
// =====================================

bot.onText(/^\/stopmio(?:@\w+)?$/i, async (msg) => {

    const chatId = msg.chat.id;


    // بررسی مالک
    if (!isOwner(msg)) {

        await sendAccessDenied(chatId);

        return;
    }


    // فقط گروه
    if (
        msg.chat.type !== "group" &&
        msg.chat.type !== "supergroup"
    ) {

        await bot.sendMessage(
            chatId,
            "❌ دستور /stopmio فقط داخل گروه قابل استفاده است."
        );

        return;
    }


    const timer = activeGroups.get(chatId);


    if (!timer) {

        await bot.sendMessage(
            chatId,
            "🐱 میو در این گروه فعال نیست."
        );

        return;
    }


    clearInterval(timer);

    activeGroups.delete(chatId);


    console.log(
        `🛑 Mio stopped | Group: ${chatId}`
    );


    await bot.sendMessage(
        chatId,
        "🛑 میو متوقف شد."
    );

});


// =====================================
// ..M SEND MIO
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
// ..M TELEGRAM ERROR
// =====================================

bot.on("polling_error", (error) => {

    console.error(
        "❌ Telegram polling error:",
        error.message
    );

});


// =====================================
// ..M SHUTDOWN
// =====================================

function shutdown(signal) {

    console.log(
        `🛑 Received ${signal}`
    );


    for (const timer of activeGroups.values()) {

        clearInterval(timer);

    }


    activeGroups.clear();


    bot.stopPolling();


    process.exit(0);

}


process.on(
    "SIGINT",
    () => shutdown("SIGINT")
);

process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
);