// =====================================
// ..M MioBot
// Cloudflare Worker
// File: worker.js
// =====================================

const ADMIN_USERNAME = "mehdi2410l";
const SUPPORT_TEXT =
  "⛔ دسترسی شما فعال نیست.\n\n" +
  "برای دریافت دسترسی، لطفاً به پشتیبانی پیام دهید:\n" +
  "👉 @" + ADMIN_USERNAME;

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      // -------------------------------
      // Health Check
      // -------------------------------
      if (request.method === "GET" && url.pathname === "/") {
        return new Response(
          JSON.stringify({
            ok: true,
            service: "MioBot",
            status: "online"
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=UTF-8"
            }
          }
        );
      }

      // -------------------------------
      // Telegram Webhook
      // -------------------------------
      if (
        request.method === "POST" &&
        url.pathname === "/webhook"
      ) {
        const update = await request.json();

        await handleTelegramUpdate(update, env);

        return new Response("OK", {
          status: 200
        });
      }

      return new Response("Not Found", {
        status: 404
      });

    } catch (error) {
      console.error("MioBot Worker Error:", error);

      return new Response(
        JSON.stringify({
          ok: false,
          error: "Internal Server Error"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json; charset=UTF-8"
          }
        }
      );
    }
  }
};


// =====================================
// Telegram Update Handler
// =====================================

async function handleTelegramUpdate(update, env) {

  if (!update || !update.message) {
    return;
  }

  const message = update.message;
  const chat = message.chat;

  if (!chat || !chat.id) {
    return;
  }

  const text = message.text || "";
  const username = String(
    message.from?.username || ""
  ).toLowerCase();

  // -------------------------------
  // /start
  // -------------------------------

  if (text === "/start") {

    // فقط مالک اصلی
    if (username === ADMIN_USERNAME) {

      await sendTelegramMessage(
        env,
        chat.id,
        "🤖 MioBot\n\n" +
        "✅ خوش آمدید مدیر.\n\n" +
        "دسترسی شما فعال است."
      );

      return;
    }

    // کاربران دیگر
    await sendTelegramMessage(
      env,
      chat.id,
      SUPPORT_TEXT
    );

    return;
  }

  // -------------------------------
  // سایر پیام‌ها
  // -------------------------------

  if (username !== ADMIN_USERNAME) {

    await sendTelegramMessage(
      env,
      chat.id,
      SUPPORT_TEXT
    );

    return;
  }

  // -------------------------------
  // پیام‌های مدیر
  // -------------------------------

  await sendTelegramMessage(
    env,
    chat.id,
    "✅ MioBot آنلاین است.\n\n" +
    "دستور دریافت شد."
  );
}


// =====================================
// Telegram API
// =====================================

async function sendTelegramMessage(
  env,
  chatId,
  text
) {

  if (!env.TELEGRAM_BOT_TOKEN) {
    console.error(
      "TELEGRAM_BOT_TOKEN is not configured."
    );

    return;
  }

  const telegramUrl =
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(
    telegramUrl,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        chat_id: chatId,
        text
      })
    }
  );

  if (!response.ok) {
    console.error(
      "Telegram API error:",
      await response.text()
    );
  }
}