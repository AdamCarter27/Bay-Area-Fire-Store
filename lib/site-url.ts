/*
 * The site's public origin, kept in one place so `metadataBase`, the sitemap
 * and robots.txt can never disagree about it — a sitemap that lists a
 * different host than the canonical tags is a sitemap Google ignores.
 *
 * Set NEXT_PUBLIC_SITE_URL at deploy time; the localhost fallback only keeps
 * local development from warning.
 *
 * `||` rather than `??` on purpose: a deploy context with the variable cleared
 * in the Netlify UI can arrive as an empty string rather than as unset, and an
 * empty SITE_URL takes down the build — `new URL("")` throws where
 * app/layout.tsx builds metadataBase.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * The one origin the live store is served from. Anything else — a
 * workers.dev preview, a branch deploy, localhost — is not the real site.
 *
 * Must match NEXT_PUBLIC_SITE_URL in Netlify exactly, and both must match the
 * primary domain set there: the apex and www both resolve, but only the
 * primary one serves — the other 301s to it. Disagree and IS_PRODUCTION_SITE
 * goes false, which puts `noindex` on every page of the live store.
 */
export const PRODUCTION_URL = "https://www.bayareafirestore.com";

/**
 * Whether this build is the customer-facing store.
 *
 * Preview deployments are publicly reachable URLs serving the owner's real
 * catalog, so without this they compete with the real store in search results
 * and can show a shopper a copy of the site nobody is maintaining. Every page
 * carries `noindex` when this is false — see app/layout.tsx.
 */
export const IS_PRODUCTION_SITE = SITE_URL === PRODUCTION_URL;
