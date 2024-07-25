import { generateSecretToken } from "../../lib/utils";

const SECRET_KEY = process.env.TELEGRAM_BOT_SECRET;

export const config = {
  runtime: "edge",
};

export async function GET(request: Request) {
  if (!SECRET_KEY) {
    return new Response(
      JSON.stringify({
        ok: false,
        description: "Internal Server Error",
        result: `Secret key not found`,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const token = request.headers.get("x-telegram-bot-token");
  const username = request.headers.get("x-telegram-bot-username");

  if (!token || !username) {
    return new Response(
      JSON.stringify({
        ok: false,
        description: "Bad Request",
        result: `Token or username not found`,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const secretToken = await generateSecretToken(token, username);

  return new Response(
    JSON.stringify({
      ok: true,
      description: "Success",
      result: { secretToken },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
