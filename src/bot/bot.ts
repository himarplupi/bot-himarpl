import { eq } from "drizzle-orm";
import type TelegramAPI from "node-telegram-bot-api";

import ResponsesID from "~/bot/responses/id.json";
import { db } from "~/server/db";
import { notifications } from "~/server/db/schema";

const API_URL = process.env.TELEGRAM_BOT_API_URL;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!API_URL || !TOKEN) {
  throw new Error("API URL and Token not specified");
}

interface Command {
  command: string;
  description: string;
  handler: (message: TelegramAPI.Message) => Promise<void>;
}

type Commands = Record<string, Command>;

type Method =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD"
  | "CONNECT"
  | "TRACE";

/**
 * Creates a new instance of the Bot.
 * @param token - The token used to authenticate with the Telegram API.
 * @returns An object with methods to interact with the Telegram API.
 */
const Bot = (token: string) => {
  async function fetchTelegramAPI<T>(
    telegramRoute: string,
    method?: Method,
    init?: RequestInit,
  ): Promise<T> {
    const response = await fetch(`${API_URL}/bot${token}${telegramRoute}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: method ?? "GET",
      ...init,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${telegramRoute}:\n${JSON.stringify(response)}`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.json();
  }

  const PARSE_MODE = ResponsesID.format as TelegramAPI.ParseMode;
  const responses = ResponsesID.responses;

  const methods = {
    /**
     * Sends a message to a chat.
     * @param chatId - The ID of the chat to send the message to.
     * @param text - The text of the message.
     * @param options - Additional options for sending the message.
     * @returns A Promise that resolves to the sent message.
     */
    sendMessage: async (
      chatId: number,
      text: string,
      options?: TelegramAPI.SendMessageOptions,
    ): Promise<TelegramAPI.Message | undefined> => {
      const defaultOptions: TelegramAPI.SendMessageOptions = {
        parse_mode: PARSE_MODE,
        ...options,
      };
      const data = await fetchTelegramAPI<TelegramAPI.Message>(
        "/sendMessage",
        "POST",
        {
          body: JSON.stringify({
            chat_id: chatId,
            text,
            ...defaultOptions,
          }),
        },
      );

      return data;
    },
  };

  const commands: Commands = {
    start: {
      command: "/start",
      description: "Memulai bot HIMARPL",
      handler: async (message: TelegramAPI.Message) => {
        const chatId = message.chat.id;
        const currentResponse = responses.commands["/start"].success
          .replace("${first_name}", message.from?.first_name ?? "")
          .replace("${last_name}", message.from?.last_name ?? "");

        await methods.sendMessage(chatId, currentResponse);

        const cta = responses.commands["/start"]["to-cta"] + responses.cta;
        await methods.sendMessage(chatId, cta);
      },
    },
    notifyme: {
      command: "/notifyme",
      description: "Tidak ingin ketinggalan info terbaru dari HIMARPL",
      handler: async (message: TelegramAPI.Message) => {
        const chatId = message.chat.id;
        const firstName = message.from?.first_name ?? "";
        const lastName = message.from?.last_name ?? "";
        const username = message.from?.username ?? "";

        const exist = await db.query.notifications.findFirst({
          where: eq(notifications.chatId, chatId),
        });

        if (exist) {
          const currentResponse = responses.commands["/notify"].nothing.replace(
            "${first_name}",
            firstName,
          );
          await methods.sendMessage(chatId, currentResponse);
          return;
        }

        const result = await db.insert(notifications).values({
          chatId: chatId,
          firstName: firstName,
          lastName: lastName,
          username: username,
        });

        if (!result) {
          const currentResponse = responses.commands["/notify"].failed.replace(
            "${first_name}",
            firstName,
          );
          await methods.sendMessage(chatId, currentResponse);
          return;
        }

        const currentResponse = responses.commands["/notify"].success.replace(
          "${first_name}",
          firstName,
        );

        await methods.sendMessage(chatId, currentResponse);

        const cta = responses.commands["/notify"]["to-cta"] + responses.cta;

        await methods.sendMessage(chatId, cta);
      },
    },
    unnotifyme: {
      command: "/unnotifyme",
      description: "Berhenti mendapatkan info terbaru dari HIMARPL :(",
      handler: async (message: TelegramAPI.Message) => {
        const chatId = message.chat.id;
        const firstName = message.from?.first_name ?? "";

        const exist = await db.query.notifications.findFirst({
          where: eq(notifications.chatId, chatId),
        });

        if (!exist) {
          const currentResponse = responses.commands[
            "/unnotify"
          ].nothing.replace("${first_name}", firstName);
          await methods.sendMessage(chatId, currentResponse);
          return;
        }

        const result = await db
          .delete(notifications)
          .where(eq(notifications.chatId, chatId));

        if (!result) {
          const currentResponse = responses.commands[
            "/unnotify"
          ].failed.replace("${first_name}", firstName);
          await methods.sendMessage(chatId, currentResponse);
          return;
        }

        const currentResponse = responses.commands["/unnotify"].success;

        await methods.sendMessage(chatId, currentResponse);

        const cta = responses.commands["/unnotify"]["to-cta"] + responses.cta;

        await methods.sendMessage(chatId, cta);
      },
    },
  };

  return {
    ...methods,
    commands,
    responses: ResponsesID.responses,
    listenCommands: async (
      message: TelegramAPI.Message,
      rawTextCommand: string,
    ) => {
      if (!rawTextCommand.startsWith("/")) return;

      const chatId = message.chat.id;
      const incomingCommand = rawTextCommand.substring(1);

      for (const command in commands) {
        if (incomingCommand === command) {
          return await commands[command]?.handler(message);
        }
      }

      const msg = `Maaf ya ${message.from?.first_name}, perintah /${incomingCommand} tidak ada.\nKalau ingin kontribusi dalam project open source untuk menaikan levelku, silakan kunjungi [GitHub HIMARPL](https://github.com/himarplupi/bot-himarpl)\n✌️\n\n| [Website](https://www.himarpl.com) | [Instagram](https://instagram.com/himarpl) | [Youtube](https://www.youtube.com/@himarplcibiru5901) | [TikTok](https://www.tiktok.com/@himarpl) | [Github](https://github.com/himarplupi) |`;
      return await methods.sendMessage(chatId, msg, {
        parse_mode: "Markdown",
      });
    },
  };
};

const bot = Bot(TOKEN);

export { bot };
