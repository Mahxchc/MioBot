// =====================================
// ..M MioBot
// Telegram Bot :: Render Web Service
// File: bot.js
// =====================================

import TelegramBot from "node-telegram-bot-api";
import http from "node:http";

// =====================================
// تنظیمات
// =====================================

const BOT_TOKEN = process.env.BOT_TOKEN;

const OWNER_USERNAME = "mehdi2410l";

const GROUP_CHAT_ID = process.env.GROUP_CHAT_ID;

const PORT = process.env.PORT || 10000;

// 5 دقیقه و 20 ثانیه
const MIO_INTERVAL = 5 * 60 * 1000 + 20 * 1000;

// =====================================
// بررسی BOT_TOKEN
// =====================================

if (!BOT_TOKEN) {
    console.error("❌ BOT_TOKEN is not configured.");
    process.exit(1);
}

// =====================================
// ساخت ربات
// =====================================

const bot = new TelegramBot(BOT_TOKEN, {
    polling: true
});

// =====================================
// بررسی مالک
// =====================================

function isOwner(msg) {
    const username = String(
        msg?.from?.username || ""
    ).toLowerCase();

    return username === OWNER_USERNAME.toLowerCase();
}

// =====================================
// پیام دسترسی
// =====================================

async function sendSupportMessage(chatId) {
    try {
        await bot.sendMessage(
            chatId,
            "⛔ دسترسی شما فعال نیست.\n\n" +
            "برای دریافت دسترسی، لطفاً به پشتیبانی پیام دهید:\n" +
            "👉 @mehdi2410l"
        );
    } catch (error) {
        console.error(
            "❌ Support message error:",
            error.message
        );
    }
}

// =====================================
// دستور /start
// =====================================

bot.onText(/^\/start$/, async (msg) => {
    try {
        if (!isOwner(msg)) {
            await sendSupportMessage(msg.chat.id);
            return;
        }

        await bot.sendMessage(
            msg.chat.id,
            "🤖 MioBot\n\n" +
            "✅ خوش آمدید مدیر.\n\n" +
            "🟢 ربات فعال است.\n" +
            "⏱ فاصله ارسال میو: ۵ دقیقه و ۲۰ ثانیه"
        );

    } catch (error) {
        console.error(
            "❌ /start error:",
            error.message
        );
    }
});

// =====================================
// دستور /status
// =====================================

bot.onText(/^\/status$/, async (msg) => {
    try {
        if (!isOwner(msg)) {
            await sendSupportMessage(msg.chat.id);
            return;
        }

        await bot.sendMessage(
            msg.chat.id,
            "🤖 MioBot\n\n" +
            "🟢 وضعیت: فعال\n" +
            "⏱ فاصله: ۵ دقیقه و ۲۰ ثانیه\n" +
            "👤 مالک: @" + OWNER_USERNAME
        );

    } catch (error) {
        console.error(
            "❌ /status error:",
            error.message
        );
    }
});

// =====================================
// پیام‌های معمولی
// =====================================

bot.on("message", async (msg) => {
    try {
        if (!msg || !msg.text) {
            return;
        }

        if (
            msg.text === "/start" ||
            msg.text === "/status"
        ) {
            return;
        }

        if (!isOwner(msg)) {
            return;
        }

    } catch (error) {
        console.error(
            "❌ Message handler error:",
            error.message
        );
    }
});

// =====================================
// ارسال میو
// =====================================

async function sendMio() {

    if (!GROUP_CHAT_ID) {
        console.error(
            "⚠️ GROUP_CHAT_ID is not configured."
        );
        return;
    }

    try {

        await bot.sendMessage(
            GROUP_CHAT_ID,
            "میو"
        );

        console.log(
            "😺 میو ارسال شد | " +
            new Date().toISOString()
        );

    } catch (error) {

        console.error(
            "❌ Error sending میو:",
            error.message
        );
    }
}

// =====================================
// شروع تایمر
// =====================================

setInterval(
    sendMio,
    MIO_INTERVAL
);

// =====================================
// Web Server برای Render
// =====================================

const server = http.createServer(
    (req, res) => {

        if (
            req.method === "GET" &&
            req.url === "/"
        ) {

            res.writeHead(
                200,
                {
                    "Content-Type":
                        "application/json; charset=utf-8"
                }
            );

            res.end(
                JSON.stringify({
                    ok: true,
                    service: "MioBot",
                    status: "online"
                })
            );

            return;
        }

        if (
            req.method === "GET" &&
            req.url === "/health"
        ) {

            res.writeHead(
                200,
                {
                    "Content-Type":
                        "application/json; charset=utf-8"
                }
            );

            res.end(
                JSON.stringify({
                    ok: true,
                    bot: "MioBot",
                    status: "running"
                })
            );

            return;
        }

        res.writeHead(404);
        res.end("Not Found");
    }
);

// =====================================
// شروع سرور
// =====================================

server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "====================================="
        );

        console.log(
            "🤖 MioBot"
        );

        console.log(
            "====================================="
        );

        console.log(
            "✅ Bot started successfully"
        );

        console.log(
            "⏱ Mio interval: 5 minutes 20 seconds"
        );

        console.log(
            "👤 Owner: " + OWNER_USERNAME
        );

        console.log(
            "🌐 HTTP server listening on port: " +
            PORT
        );

        console.log(
            "====================================="
        );
    }
);

// =====================================
// خطای Polling
// =====================================

bot.on(
    "polling_error",
    (error) => {

        console.error(
            "❌ Telegram polling error:",
            error.message
        );
    }
);

// =====================================
// خطای عمومی
// =====================================

process.on(
    "uncaughtException",
    (error) => {

        console.error(
            "❌ Uncaught Exception:",
            error
        );
    }
);

process.on(
    "unhandledRejection",
    (error) => {

        console.error(
            "❌ Unhandled Rejection:",
            error
        );
    }
);