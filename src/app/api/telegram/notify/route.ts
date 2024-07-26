import { NextResponse } from "next/server";

import { ipAddress } from "@vercel/functions";

import { env } from "~/env";
import { ratelimit } from "~/server/ratelimit";

const API_TOKEN = env.API_TOKEN;

export const runtime = "edge";

type NotifyBody = {
  slug: string;
  title: string;
  author: {
    name: string;
    username: string;
  };
};

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

  // Check if the API token is valid
  const apiToken = request.headers.get("x-api-token");

  if (apiToken !== API_TOKEN) {
    return NextResponse.json(
      {
        ok: false,
        description: "Unauthorized",
        result: `Invalid API token`,
      },
      {
        status: 401,
      },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const body = await request.json();

  return NextResponse.json(
    {
      ok: false,
      description: "Bad Request",
      result: `Invalid request body`,
    },
    {
      status: 400,
    },
  );
}
