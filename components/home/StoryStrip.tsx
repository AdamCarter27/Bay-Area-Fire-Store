import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function StoryStrip() {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-28">
      <Reveal>
        <span
          aria-hidden
          className="mx-auto block h-2.5 w-2.5 rounded-full bg-signal"
        />
        <p className="mt-8 font-display text-[clamp(1.6rem,3.5vw,2.4rem)] font-medium leading-[1.25] tracking-tight text-ink">
          A firefighter-owned business, established in 2024 — your trusted source
          for high-quality on- and off-duty apparel.
        </p>
        <p className="mx-auto mt-6 max-w-xl text-ash">
          Our mission is to support the firefighting community with gear that
          combines functionality and style.
        </p>
        <div className="mt-9">
          <Button href="/about" variant="secondary">
            About us
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
