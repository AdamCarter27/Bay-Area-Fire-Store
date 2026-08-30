/*
 * OpenNext adapter config for deploying this Next app to Wix-managed headless
 * hosting, which runs the Cloudflare Workers runtime.
 *
 * Deliberately no `incrementalCache`. The adapter's stock config points at an
 * R2 bucket, and the alternatives (KV, regional cache) are all wrappers over a
 * Cloudflare account's storage bindings. Wix gives us the Workers *runtime*,
 * not a Cloudflare account, so there is no bucket to bind.
 *
 * The consequence is real and worth knowing: `unstable_cache` in
 * lib/data/products.ts has nowhere to persist, so the 5-minute catalog cache
 * does not survive between requests. React `cache()` still dedupes the read
 * within a single render, so it stays one catalog fetch per page view rather
 * than one per component.
 */
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
