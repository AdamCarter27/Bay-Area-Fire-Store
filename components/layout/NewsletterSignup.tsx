"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { inputBase } from "@/components/ui/Field";
import { submitNewsletterSignup } from "@/lib/submit-newsletter";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [consented, setConsented] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consented || status === "submitting") return;

    setStatus("submitting");
    try {
      await submitNewsletterSignup(email);
      setStatus("success");
    } catch (error) {
      console.error("[newsletter] signup failed", error);
      setStatus("error");
    }
  }

  return (
    <section aria-labelledby="newsletter-heading" className="max-w-md">
      <h2 id="newsletter-heading" className="font-display text-lg font-semibold text-ink">
        Get on the list
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ash">
        Occasional updates on new gear, custom work, and what’s happening around the store.
      </p>

      {status === "success" ? (
        <p role="status" className="mt-4 text-sm font-medium text-ink">
          Thanks for subscribing!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="Your email address"
            className={inputBase}
            disabled={status === "submitting"}
          />

          <label className="flex items-start gap-2 text-xs leading-relaxed text-ash">
            <input
              type="checkbox"
              required
              checked={consented}
              onChange={(event) => setConsented(event.target.checked)}
              className="mt-0.5 accent-signal"
              disabled={status === "submitting"}
            />
            <span>Yes, email me occasional news and offers from Bay Area Fire Store.</span>
          </label>

          <Button type="submit" size="md" disabled={status === "submitting" || !consented}>
            {status === "submitting" ? "Subscribing…" : "Subscribe"}
          </Button>

          {status === "error" && (
            <p role="alert" className="text-xs text-signal-deep">
              We couldn’t add you just now. Please try again.
            </p>
          )}
        </form>
      )}
    </section>
  );
}
