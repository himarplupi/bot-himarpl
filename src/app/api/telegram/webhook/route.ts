import { NextResponse } from "next/server";

import { ipAddress } from "@vercel/functions";

import bot, { type Update } from "~/bot";
import { env } from "~/env";
import { generateSecretToken } from "~/lib/hash";
import { ratelimit } from "~/server/ratelimit";

const TOKEN = env.TELEGRAM_BOT_TOKEN;
const BOT_USERNAME = env.TELEGRAM_BOT_USERNAME;

export const runtime = "edge";

export async function POST(request: Request) {
  // Rate limit the request
  const ip = ipAddress(request) ?? "unknown";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      {
        ok: false,
        description: "Too Many Requests",
        result: "Rate limit exceeded",
      },
      {
        status: 429,
        statusText: "Too Many Requests",
      },
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
      },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const body: Update = await request.json();

  if (body?.message) {
    // eslint-disable-next-line
    const message = body.message;

    // Listen for the incoming command message
    if (message.text?.startsWith("/")) {
      await bot.listenCommands(message, message.text ?? "");
    } else if (message.from) {
      const msg = `Halo, *${message.from.first_name}*!\nUntuk saat ini aku hanya bisa memberikan notifikasi 😁\nKalau ingin kontribusi dalam project open source untuk menaikan levelku, silakan kunjungi [GitHub HIMARPL](https://github.com/himarplupi/bot-himarpl)\n✌️\n\nCek juga HIMARPL di:\n| [Website](https://www.himarpl.com) | [Instagram](https://instagram.com/himarpl) | [Youtube](https://www.youtube.com/@himarplcibiru5901) | [TikTok](https://www.tiktok.com/@himarpl) | [Github](https://github.com/himarplupi) |`;
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
      },
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
    },
  );
}
