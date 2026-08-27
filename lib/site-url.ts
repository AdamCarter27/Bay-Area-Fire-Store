/*
 * The site's public origin, kept in one place so `metadataBase`, the sitemap
 * and robots.txt can never disagree about it — a sitemap that lists a
 * different host than the canonical tags is a sitemap Google ignores.
 *
 * Set NEXT_PUBLIC_SITE_URL at deploy time; the localhost fallback only keeps
 * local development from warning.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
