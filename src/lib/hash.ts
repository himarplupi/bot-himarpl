import { env } from "~/env";

export async function generateSecretToken(
  token: string | string[],
  username: string | string[],
) {
  const components = [token, username, env.TELEGRAM_BOT_SECRET].join(":");
  const encoder = new TextEncoder();
  const data = encoder.encode(components);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
