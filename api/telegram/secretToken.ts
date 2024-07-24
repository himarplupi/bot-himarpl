import type { VercelRequest, VercelResponse } from "@vercel/node";

const SECRET_KEY = process.env.TELEGRAM_BOT_SECRET;

export const runtime = "edge";

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
  const encoder = new TextEncoder();
  const data = encoder.encode(components);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  const secretToken = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  console.log(secretToken);

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
