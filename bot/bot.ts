import type TelegramAPI from "node-telegram-bot-api";

const API_URL = process.env.TELEGRAM_BOT_API_URL;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!API_URL || !TOKEN) {
  throw new Error("API URL and Token not specified");
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

  return {
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
    ): Promise<TelegramAPI.Message> => {
      try {
        const defaultOptions: TelegramAPI.SendMessageOptions = {
          parse_mode: "Markdown",
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
        return error;
      }
    },
  };
};

export const bot = Bot(TOKEN);
