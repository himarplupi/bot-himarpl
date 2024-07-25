import type TelegramAPI from "node-telegram-bot-api";

import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);
const db = new PrismaClient({ adapter });

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

interface Commands {
  [key: string]: Command;
}

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
    init?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_URL}/bot${token}${telegramRoute}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: method ?? "GET",
      ...init,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${telegramRoute}:\n${response}`);
    }

    return response.json();
  }

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
      options?: TelegramAPI.SendMessageOptions
    ): Promise<TelegramAPI.Message | undefined> => {
      try {
        const defaultOptions: TelegramAPI.SendMessageOptions = {
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
          }
        );

        return data;
      } catch (error) {
        console.error(error);
        return;
      }
    },
  };

  const commands: Commands = {
    start: {
      command: "/start",
      description: "Memulai bot HIMARPL",
      handler: async (message: TelegramAPI.Message) => {
        const chatId = message.chat.id;
        const msg = `
          *Halo ${
            (message.from?.first_name ?? "") +
            " " +
            (message.from?.last_name ?? "")
          }, apakah ada yang bisa dibantu?*\n\n /notifyme - Untuk mendapatkan notifikasi terkait postingan terbaru dari [Blog HIMARPL](https://blog.himarpl.com)
        `;

        await methods.sendMessage(chatId, msg, {
          parse_mode: "Markdown",
        });

        await methods.sendMessage(
          chatId,
          "Cek juga HIMARPL di:\n| [Website](https://www.himarpl.com) | [Instagram](https://instagram.com/himarpl) | [Youtube](https://www.youtube.com/@himarplcibiru5901) | [TikTok](https://www.tiktok.com/@himarpl) | [Github](https://github.com/himarplupi) |",
          {
            parse_mode: "Markdown",
          }
        );
      },
    },
    notifyme: {
      command: "/notifyme",
      description: "Tidak ingin ketinggalan info terbaru dari HIMARPL",
      handler: async (message: TelegramAPI.Message) => {
        const chatId = message.chat.id;

        const exist = await db.notification.findFirst({
          where: {
            chatId: chatId,
          },
        });

        if (exist) {
          await methods.sendMessage(
            chatId,
            `Sabar ya, *${message.from?.first_name}* 😊 Nanti aku pasti kirim kok!`,
            {
              parse_mode: "Markdown",
            }
          );
          return;
        }

        const result = await db.notification.create({
          data: {
            chatId: chatId,
            firstName: message.from?.first_name ?? "",
            lastName: message.from?.last_name ?? "",
            username: message.from?.username ?? "",
          },
        });

        if (!result) {
          await methods.sendMessage(
            chatId,
            `Maaf ya, *${message.from?.first_name}* 😞 Kurirnya lagi macet nih. Coba lagi nanti ya!`,
            {
              parse_mode: "Markdown",
            }
          );
          return;
        }

        const msg = `Yeay, *${message.from?.first_name}*! Ditunggu ya pesan cinta dari aku 💖😊`;

        await methods.sendMessage(chatId, msg, {
          parse_mode: "Markdown",
        });

        await methods.sendMessage(
          chatId,
          "Lihat-lihat juga HIMARPL ya, di:\n| [Website](https://www.himarpl.com) | [Instagram](https://instagram.com/himarpl) | [Youtube](https://www.youtube.com/@himarplcibiru5901) | [TikTok](https://www.tiktok.com/@himarpl) | [Github](https://github.com/himarplupi) |",
          {
            parse_mode: "Markdown",
          }
        );
      },
    },
    unnotifyme: {
      command: "/unnotifyme",
      description: "Berhenti mendapatkan info terbaru dari HIMARPL :(",
      handler: async (message: TelegramAPI.Message) => {
        const chatId = message.chat.id;

        const exist = await db.notification.findFirst({
          where: {
            chatId: chatId,
          },
        });

        if (!exist) {
          await methods.sendMessage(
            chatId,
            `/notifyme dulu ya, *${message.from?.first_name}* 😁`,
            {
              parse_mode: "Markdown",
            }
          );
          return;
        }

        const result = await db.notification.delete({
          where: {
            chatId: chatId,
          },
        });

        if (!result) {
          await methods.sendMessage(
            chatId,
            `Maaf ya, *${message.from?.first_name}* 😞 Kurirnya lagi macet nih. Coba lagi nanti ya!`,
            {
              parse_mode: "Markdown",
            }
          );
          return;
        }

        const msg = "Oke deh 😞💔";

        await methods.sendMessage(chatId, msg, {
          parse_mode: "Markdown",
        });

        await methods.sendMessage(
          chatId,
          "...\n\n| [Website](https://www.himarpl.com) | [Instagram](https://instagram.com/himarpl) | [Youtube](https://www.youtube.com/@himarplcibiru5901) | [TikTok](https://www.tiktok.com/@himarpl) | [Github](https://github.com/himarplupi) |",
          {
            parse_mode: "Markdown",
          }
        );
      },
    },
  };

  return {
    ...methods,
    commands,
    listenCommands: async (
      message: TelegramAPI.Message,
      rawTextCommand: string
    ) => {
      if (!rawTextCommand.startsWith("/")) return;

      const chatId = message.chat.id;
      const incomingCommand = rawTextCommand.substring(1);

      for (const command in commands) {
        if (incomingCommand === command) {
          return await commands[command].handler(message);
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
