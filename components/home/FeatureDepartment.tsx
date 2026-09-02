import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/ui/SplitHeadline";

export function FeatureDepartmentSection() {
  return (
    <section className="bg-ink py-16 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 text-center sm:px-8">
        <Reveal>
          <SplitHeadline
            mode="play"
            className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-paper"
          >
            Want your department featured?
          </SplitHeadline>
        </Reveal>
        <Reveal delay={80}>
          <p className="mx-auto mt-4 max-w-xl text-paper/70">
            If your department, club, or organization isn&apos;t on the site
            yet, we&apos;d love to build a collection for you. Reach out and
            let&apos;s make it happen.
          </p>
        </Reveal>
        <Reveal delay={160}>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-paper px-8 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90"
          >
            Get Featured →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}