"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

/*
 * Last resort: this only renders when the root layout itself throws, which
 * means the header, footer, fonts, and cart provider are all unavailable. It
 * has to supply its own <html> and <body> because it replaces the root layout
 * rather than rendering inside it, and for the same reason it can't rely on
 * the design system's classes — the styles may not have loaded. Hence the
 * inline styles, which is deliberate rather than sloppy.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[app] root layout error", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // DESIGN.md's `paper` and `ink`, written literally: the stylesheet
          // that defines the CSS custom properties may not have loaded when
          // the root layout is what failed.
          background: "oklch(0.992 0 0)",
          color: "oklch(0.19 0.008 25)",
          fontFamily:
            "Inter, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <main style={{ maxWidth: "32rem" }}>
          <h1
            style={{
              fontFamily: "Fraunces, Georgia, serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)", // headline step
              fontWeight: 600,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Bay Area Fire Store
          </h1>

          <p
            style={{
              marginTop: "1rem",
              fontSize: "1rem",
              lineHeight: 1.6,
              color: "oklch(0.34 0.006 25)", // ink-soft
            }}
          >
            The site hit an unexpected error and couldn&apos;t load. Please try
            again in a moment.
          </p>

          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: "1.75rem",
              cursor: "pointer",
              border: "none",
              borderRadius: "9999px",
              padding: "0.75rem 1.75rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "oklch(0.99 0.008 60)", // on-signal
              background: "oklch(0.523 0.192 27)", // signal
            }}
          >
            Try again
          </button>

          <p
            style={{
              marginTop: "2rem",
              fontSize: "0.75rem", // label step
              letterSpacing: "0.05em",
              color: "oklch(0.462 0.006 25)", // ash
            }}
          >
            Need us?{" "}
            <a
              href="mailto:Info@bayareafirestore.com"
              style={{ color: "oklch(0.19 0.008 25)" }}
            >
              Info@bayareafirestore.com
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
