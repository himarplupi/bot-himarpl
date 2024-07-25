import type { VercelRequest, VercelResponse } from "@vercel/node";

import bot, { type Message } from "../../bot";
import { generateSecretToken } from "../../lib/utils";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME;
const API_URL = process.env.TELEGRAM_BOT_API_URL;

export const runtime = "edge";

async function POST(req: VercelRequest, res: VercelResponse) {
  if (!TOKEN || !BOT_USERNAME || !API_URL) {
    return res.status(500).json({
      ok: false,
      description: "Internal Server Error",
      result: "The required environment variables are not found",
    });
  }

  const secretToken = req.headers["x-telegram-bot-api-secret-token"];
  const expectedSecretToken = await generateSecretToken(TOKEN, BOT_USERNAME);

  if (secretToken !== expectedSecretToken) {
    return res.status(403).json({
      ok: false,
      description: "Forbidden",
      result: `Invalid secret token`,
    });
  }

  if (req.body.message) {
    const { chat, text } = req.body.message as Message;

    // Send the message back
    const message = `✅ Thanks for your message: *"${text}"*\nHave a great day! 👋🏻`;

    await bot.sendMessage(chat.id, message);

    return res.json({
      ok: true,
      description: "Success",
      result: `Message sent to ${chat.id}`,
    });
  }

  return res.json({
    ok: true,
    description: "Success",
    result: `No message found`,
  });
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    switch (req.method) {
      case "POST":
        return POST(req, res);
      default:
        return res.status(405).json({
          ok: false,
          description: "Method Not Allowed",
        });
    }
  } catch (e) {
    return res.status(500).json({
      ok: false,
      description: "Internal Server Error",
    });
  }
}
