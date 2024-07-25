import { ipAddress } from "@vercel/functions";

import bot, { type Message } from "../../bot";
import { generateSecretToken } from "../../lib/utils";
import { ratelimit } from "../../lib/ratelimit";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME;
const API_URL = process.env.TELEGRAM_BOT_API_URL;

export const config = {
  runtime: "edge",
};

export async function POST(request: Request) {
  if (!TOKEN || !BOT_USERNAME || !API_URL) {
    return new Response(
      JSON.stringify({
        ok: false,
        description: "Internal Server Error",
        result: "Missing environment variables",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Rate limit the request
  const ip = ipAddress(request) || "unknown";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response(
      JSON.stringify({
        ok: false,
        description: "Too Many Requests",
        result: "Rate limit exceeded",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const secretToken = request.headers.get("x-telegram-bot-api-secret-token");
  const expectedSecretToken = await generateSecretToken(TOKEN, BOT_USERNAME);

  if (secretToken !== expectedSecretToken) {
    return new Response(
      JSON.stringify({
        ok: false,
        description: "Forbidden",
        result: `Invalid secret token`,
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
  const body = await request.json();

  if (body && body.message) {
    const message = body.message as Message;

    // Listen for the incoming command message
    if (message.text?.startsWith("/")) {
      await bot.listenCommands(message, message.text ?? "");
    } else if (message.from) {
      const msg = `Halo, *${message.from.first_name}*!\nUntuk saat ini aku hanya bisa memberikan notifikasi 😁\n Kalau ingin kontribusi dalam project open source untuk menaikan levelku, silakan kunjungi [GitHub HIMARPL](https://github.com/himarplupi/bot-himarpl)\n✌️`;
      await bot.sendMessage(message.chat.id, msg, {
        parse_mode: "Markdown",
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        description: "Success",
        result: `Message sent to ${message.chat.id}`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return new Response(
    JSON.stringify({
      ok: false,
      description: "Bad Request",
      result: `Invalid request body`,
    }),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
