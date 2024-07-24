import type NodeApi from "node-telegram-bot-api";

export interface SendMessageOptions extends NodeApi.SendMessageOptions {
  chat_id: number;
  text: string;
}

export interface Message extends NodeApi.Message {}
