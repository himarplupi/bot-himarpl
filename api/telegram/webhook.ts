import type { VercelRequest, VercelResponse } from "@vercel/node";

import TelegramBot from "node-telegram-bot-api";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function POST(req: VercelRequest, res: VercelResponse) {
  if (!TOKEN) {
    return res.status(500).json({
      ok: false,
      description: "Internal Server Error",
      result: `Token not found`,
    });
  }

  const bot = new TelegramBot(TOKEN);

  if (req.body.message) {
    const {
      chat: { id },
      text,
    } = req.body.message;

    // Create a message to send back
    // We can use Markdown inside this
    const message = `✅ Thanks for your message: *"${text}"*\nHave a great day! 👋🏻`;

    await bot.sendMessage(id, message, { parse_mode: "Markdown" });

    return res.json({
      ok: true,
      description: "Success",
      result: `Message sent to ${id}`,
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
