import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-col items-center gap-6 bg-zinc-50 px-6 py-24 text-center dark:bg-zinc-950">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Your Local Source for Bay Area Fire Gear
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Discover a new level of convenience.
        </p>
        <Link
          href="/shop"
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Shop
        </Link>
      </section>

      <section aria-label="Featured products" className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="flex aspect-[16/7] items-center justify-center rounded-2xl border border-dashed border-black/[.08] text-sm text-zinc-500 dark:border-white/[.145]">
          Product carousel
        </div>
      </section>

      <section className="bg-zinc-50 px-6 py-16 text-center dark:bg-zinc-950">
        <h2 className="text-2xl font-semibold">Embroidery, Screen Print, Heat Transfers</h2>
        <p className="mx-auto mt-3 max-w-md text-zinc-600 dark:text-zinc-400">
          Bring your own design or work with us to customize department gear.
        </p>
        <Link
          href="/custom-order"
          className="mt-6 inline-block rounded-full border border-black/[.08] px-6 py-3 text-sm font-medium hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
        >
          Start Now
        </Link>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold">Firefighter-Owned, Bay Area Built</h2>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          We&apos;re a firefighter-owned retailer serving the Bay Area firefighting
          community with department apparel, custom gear, and merchandise from
          the brands you trust.
        </p>
      </section>
    </div>
  );
}
