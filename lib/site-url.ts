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

/**
 * The one origin the live store is served from. Anything else — a
 * workers.dev preview, a branch deploy, localhost — is not the real site.
 */
export const PRODUCTION_URL = "https://bayareafirestore.com";

/**
 * Whether this build is the customer-facing store.
 *
 * Preview deployments are publicly reachable URLs serving the owner's real
 * catalog, so without this they compete with the real store in search results
 * and can show a shopper a copy of the site nobody is maintaining. Every page
 * carries `noindex` when this is false — see app/layout.tsx.
 */
export const IS_PRODUCTION_SITE = SITE_URL === PRODUCTION_URL;
