import { NextResponse } from "next/server";

import { ipAddress, waitUntil } from "@vercel/functions";

import bot from "~/bot";
import { env } from "~/env";
import { ratelimit } from "~/server/ratelimit";
import { api } from "~/trpc/server";

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
  const body: NotifyBody = await request.json();

  waitUntil(intervalNotify(body));

  return NextResponse.json(
    {
      ok: true,
      description: "Notification sent",
      result: "Notification sent successfully",
    },
    {
      status: 200,
    },
  );
}

// This function behaves like a cron job that runs every 1 second for the limitation of telegram API
async function intervalNotify(body: NotifyBody) {
  const baseUrl = "https://blog.himarpl.com";
  const title = body.title;
  const slug = body.slug;
  const name = body.author.name;
  const username = body.author.username;

  const unnotify = await api.notification.getUnnotify({
    slug: `@${username}/${slug}`,
    limit: 25,
  });

  if (unnotify.length === 0) {
    const removed = await api.notification.removeNotify({
      slug: `@${username}/${slug}`,
    });

    if (!removed) {
      console.error(JSON.stringify(removed));
    }

    return;
  }

  for (const notification of unnotify) {
    await bot.sendMessage(
      notification.chatId,
      `*${notification.firstName?.toUpperCase()}, ADA POSTINGAN BARU!*\n\n[${title?.toUpperCase()}](${baseUrl}/@${username}/${slug})\nditulis oleh [${name}](${baseUrl}/@${username})`,
      {
        parse_mode: "Markdown",
      },
    );
  }

  const notify = await api.notification.notify({
    slug: `@${username}/${slug}`,
    chatIds: unnotify.map((n) => n.chatId),
  });

  if (!notify) {
    console.error(JSON.stringify(notify));
  }

  setTimeout(() => {
    // waitUntil(intervalNotify(body));
    intervalNotify(body).catch((err) => {
      console.error(err);
    });
  }, 1000);

  return;
}
