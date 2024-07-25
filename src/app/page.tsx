import Link from "next/link";

import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-tr from-zinc-950 to-zinc-900 text-white">
        <h1 className="mb-6 text-center text-6xl font-bold">BOT HIMARPL</h1>

        <Link
          className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
          href="https://docs.himarpl.com"
          target="_blank"
        >
          <h3 className="text-2xl font-bold">Dokumentasi →</h3>
          <div className="text-lg">
            Pelajari lebih lanjut tentang bot HIMARPL disini.
          </div>
        </Link>
      </main>
    </HydrateClient>
  );
}
