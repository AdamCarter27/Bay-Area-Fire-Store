import { CultureCarousel } from "@/components/home/CultureCarousel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Firefighter-owned and Bay Area built since 2024 — who we are and why we started the Bay Area Fire Store.",
};

export default function AboutPage() {
  return (
    <div>
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-4 text-center">
        <h1 className="mt-4 text-6xl font-semibold">About Us</h1>
        <p className="mt-8 text-2xl text-white-600 dark:text-white-400">
          Welcome to the Bay Area Fire Store, a firefighter-owned business 
          established in 2024. We are dedicated to being your trusted source 
          for high-quality on and off-duty apparel. Our mission is to support the 
          firefighting community with gear that combines functionality and style.
        </p>

      </div>
      <div>
        <CultureCarousel />
      </div>
    </div>
  );
}

