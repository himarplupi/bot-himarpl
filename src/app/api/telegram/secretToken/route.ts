import { NextResponse } from "next/server";

import { generateSecretToken } from "~/lib/hash";

export const runtime = "edge";

export async function GET(request: Request) {
  const token = request.headers.get("x-telegram-bot-token");
  const username = request.headers.get("x-telegram-bot-username");

  if (!token || !username) {
    return NextResponse.json(
      {
        ok: false,
        description: "Bad Request",
        result: `Token or username not found`,
      },
      {
        status: 400,
      },
    );
  }

  const secretToken = await generateSecretToken(token, username);

  return NextResponse.json(
    {
      ok: true,
      description: "Success",
      result: { secretToken },
    },
    {
      status: 200,
    },
  );
}
