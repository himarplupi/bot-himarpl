import dotenv from "dotenv";

dotenv.config();

async function deleteCommands() {
  console.log("\n=> Deleting commands...");

  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/deleteMyCommands`,
    {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!data.ok) {
    console.error("=! Failed to delete commands:", data);
    process.exit(1);
  }

  console.log("=> Successfully deleted commands:", data);
}

async function setCommands() {
  console.log("\n=> Setting commands...");

  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setMyCommands`,
    {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        commands: [{ command: "/start", description: "Memulai bot HIMARPL" }],
      }),
    }
  );

  const data = await response.json();

  if (!data.ok) {
    console.error("=! Failed to set commands:", data);
    process.exit(1);
  }

  console.log("=> Successfully set commands:", data);
}

async function main() {
  await deleteCommands();
  await setCommands();
}

main();
