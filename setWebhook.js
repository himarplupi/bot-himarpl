require("dotenv").config();
const fetch = require("node-fetch");

const BASE_URL = process.argv[2];

if (!BASE_URL) {
  console.error("=! Usage: npm tl:set-webhook <BASE_URL>");
  process.exit(1);
}

async function getSecretToken() {
  console.log("\n=> Getting secret token...");
  const response = await fetch(`${BASE_URL}/api/telegram/secretToken`, {
    method: "GET",
    headers: {
      "x-telegram-bot-token": process.env.TELEGRAM_BOT_TOKEN || "",
      "x-telegram-bot-username": process.env.TELEGRAM_BOT_USERNAME || "",
      "Content-type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("=! Failed to get secret token:", response);
    process.exit(1);
  }

  const data = await response.json();

  console.log("=> Successfully got secret token!");

  return data.result.secretToken;
}

async function setTelegramWebhook(secretToken) {
  const webhookUrl = `${BASE_URL}/api/telegram/webhook`;

  console.log("\n=> Setting webhook to:", webhookUrl);

  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`,
    {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: secretToken,
      }),
    }
  );

  const data = await response.json();

  if (!data.ok) {
    console.error("=! Failed to set webhook:", data);
    process.exit(1);
  }

  console.log("=> Successfully set webhook:", data);
}

async function main() {
  const secretToken = await getSecretToken();
  await setTelegramWebhook(secretToken);
  console.log("\n=> Webhook set successfully!\n");
}

main();
