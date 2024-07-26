import { NextResponse } from "next/server";

import { ipAddress } from "@vercel/functions";

import { generateSecretToken } from "~/lib/hash";
import { ratelimit } from "~/server/ratelimit";

export const runtime = "edge";

export async function GET(request: Request) {
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
