import { ContactForm } from "@/components/contact/ContactForm";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { SplitHeadline } from "@/components/ui/SplitHeadline";

export const metadata = {
  title: "Contact — Bay Area Fire Store",
  description:
    "Questions about an order, a department collection, or a bulk request? Reach the Bay Area Fire Store.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-8 sm:py-20">
      <SplitHeadline
        as="h1"
        mode="play"
        className="text-center font-display text-[clamp(2rem,5vw,3rem)] font-semibold tracking-tight text-ink"
      >
        Contact Us
      </SplitHeadline>

      <p className="mt-6 text-pretty text-center text-ink-soft">
        Thank you for visiting us. We encourage you to reach out with any
        questions or concerns — you are always our top priority, and we are here
        to assist you in any way we can.
      </p>

      <p className="mt-4 text-center text-sm text-ash">
        Prefer email?{" "}
        <a
          href="mailto:Info@bayareafirestore.com"
          className="font-medium text-ink underline underline-offset-2 transition-colors hover:text-signal"
        >
          Info@bayareafirestore.com
        </a>
      </p>

      <SocialLinks className="mt-6 justify-center" />

      <ContactForm />
    </div>
  );
}
