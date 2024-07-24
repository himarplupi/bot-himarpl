import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    switch (req.method) {
      case "GET":
        return res.json({
          ok: true,
          description: "Success",
          result: `Hello World!`,
        });
      case "POST":
        const { name = "World" } = req.query;
        return res.json({
          ok: true,
          description: "Success",
          result: `Hello ${name}!`,
        });
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
