/*
 * OpenNext adapter config. Deployed to Cloudflare Workers directly — see the
 * note in wrangler.jsonc for why Wix-managed hosting could not run this.
 *
 * `incrementalCache` is where regenerated ISR pages live. It is required, not
 * an optimization: app/product/[slug] prerenders all 259 products and relies
 * on `revalidate` to pick up price and stock changes. The adapter's default is
 * a no-op that accepts writes and drops them, which would leave every product
 * page frozen at build time with no error to notice.
 *
 * `queue` is what actually triggers that re-render. The default is also a
 * no-op, so the R2 bucket alone would still never be written to. MemoryQueue
 * re-requests the stale route through the WORKER_SELF_REFERENCE binding and
 * de-dupes per isolate — enough here, and it needs no Durable Object.
 *
 * `tagCache` is deliberately left at its default: nothing in this codebase
 * calls revalidateTag, so there are no tags to track.
 */
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: memoryQueue,
});
