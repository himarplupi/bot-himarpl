import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";

const SECRET_KEY = process.env.TELEGRAM_BOT_SECRET;

async function GET(req: VercelRequest, res: VercelResponse) {
  if (!SECRET_KEY) {
    return res.status(500).json({
      ok: false,
      description: "Internal Server Error",
      result: `Secret key not found`,
    });
  }

  const token = req.headers["x-telegram-bot-token"];
  const username = req.headers["x-telegram-bot-username"];

  if (!token || !username) {
    return res.status(400).json({
      ok: false,
      description: "Bad Request",
      result: `Token or username not found`,
    });
  }

  const components = [token, username].join(":");

  const secretToken = crypto
    .createHmac("sha512", SECRET_KEY)
    .update(components)
    .digest("hex");

  return res.json({
    ok: true,
    description: "Success",
    result: { secretToken },
  });
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    switch (req.method) {
      case "GET":
        return GET(req, res);
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
