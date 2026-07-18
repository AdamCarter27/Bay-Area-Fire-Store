import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/product/ProductImage";
import { Reveal } from "@/components/ui/Reveal";
export function CustomOrderCallout() {
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <h2 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] font-semibold leading-[1.05] tracking-tight text-ink justify-center">
            Got a Custom Job?
            Embroidery, Screen Print, Heat Transfers?! 
          </h2>

          <div className="mt-10">
            <Button href="/custom-order" variant="primary" size="lg">
              Send us a message
            </Button>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <ProductImage
            src=""
            alt="Custom embroidery and screen printing work"
            label="Custom work"
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="aspect-[4/3] w-full rounded-2xl border border-line lg:aspect-[5/6]"
          />
        </Reveal>
      </div>
    </section>
  );
}
