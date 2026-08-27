import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/*
 * /robots.txt.
 *
 * Deliberately no `disallow` for /cart, /checkout or /wix-test. Those pages
 * already carry `robots: { index: false }` in their own metadata, and blocking
 * a URL in robots.txt stops the crawler from ever fetching the page — which
 * means it never sees the noindex, and can still list the bare URL from
 * inbound links. Letting it crawl and read the noindex is what actually keeps
 * them out of the index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
