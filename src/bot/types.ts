import type NodeApi from "node-telegram-bot-api";

export interface SendMessageOptions extends NodeApi.SendMessageOptions {
  chat_id: number;
  text: string;
}

export type Message = NodeApi.Message;

export type Update = NodeApi.Update;
