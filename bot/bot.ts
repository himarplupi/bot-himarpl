import type TelegramAPI from "node-telegram-bot-api";

const API_URL = process.env.TELEGRAM_BOT_API_URL;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!API_URL || !TOKEN) {
  throw new Error("API URL and Token not specified");
}

interface Command {
  command: string;
  description: string;
  handler: (chatId: number) => Promise<void>;
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
      handler: async (chatId: number) => {
        const message = `
          *Halo, apakah ada yang bisa dibantu?*\n\n /notifyme - Untuk mendapatkan notifikasi terkait postingan terbaru dari [Blog HIMARPL](https://blog.himarpl.com) \n\n| [Website](https://www.himarpl.com) | [Instagram](https://instagram.com/himarpl) | [Youtube](https://www.youtube.com/@himarplcibiru5901) | [TikTok](https://www.tiktok.com/@himarpl) |
        `;

        await methods.sendMessage(chatId, message, {
          parse_mode: "Markdown",
        });
      },
    },
  };

  return {
    ...methods,
    commands,
    listenCommands: async (chatId: number, rawTextCommand: string) => {
      if (!rawTextCommand.startsWith("/")) return;

      const incomingCommand = rawTextCommand.substring(1);

      console.log(`Incoming command: ${incomingCommand}`);

      for (const command in commands) {
        if (incomingCommand === command) {
          return await commands[command].handler(chatId);
        }
      }

      const message = `Maaf, perintah /${incomingCommand} tidak ditemukan.\nSilakan bila ingin kontribusi dalam project open source ini, kunjungi [GitHub HIMARPL](https://github.com/himarplupi/bot-himarpl)`;
      return await methods.sendMessage(chatId, message, {
        parse_mode: "Markdown",
      });
    },
  };
};

const bot = Bot(TOKEN);

export { bot };
