/*
 * next/image loader for the Wix media CDN.
 *
 * Wix serves every product photo from static.wixstatic.com, and its CDN honors
 * resize params embedded in the URL path
 * (".../v1/fit/w_1200,h_1500,q_80/file.jpg"). That means Wix can hand back an
 * already-correct size, and we never need Next to transform anything.
 *
 * Which matters because we deploy to the Cloudflare Workers runtime, where
 * /_next/image needs an IMAGES binding to do its own resizing. Wix-managed
 * hosting gives us the runtime without a Cloudflare account, so that binding
 * does not exist and the optimizer fell through to passthrough — a grid
 * thumbnail downloading the full 1200x1500 original. Rewriting the URL here
 * asks Wix for the right size instead, and drops the binding dependency on
 * every host.
 *
 * Same URL shape handled by capImageSize() in lib/wix/get-prod.ts, which caps
 * the owner's camera originals at mapping time. This is the render-time half:
 * that one bounds the source, this one requests the size actually displayed.
 */

// ".../v1/fit/w_1200,h_1500,q_80/file.jpg" — `fill` is Wix's crop-to-fit mode
// and takes the same params.
const WIX_IMAGE_PARAMS_RE = /\/v1\/(fit|fill)\/w_(\d+),h_(\d+)(,[^/]*)?\//;

export default function wixImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const match = src.match(WIX_IMAGE_PARAMS_RE);

  /*
   * Everything that is not a Wix media URL in the expected shape passes
   * through untouched — local files under /public (the header logo) and any
   * URL shape Wix changes on us. A custom loader applies to every next/image
   * in the app, not just the catalog ones, so this branch has to be safe.
   */
  if (!match) return src;

  const [, mode, sourceWidth, sourceHeight] = match;

  /*
   * Never ask for more pixels than the source has. capImageSize() in
   * lib/wix/get-prod.ts caps catalog URLs at 1200px wide, but next/image
   * builds its srcset from deviceSizes and so requests 1920, 2048 and 3840
   * candidates too. Those would make Wix upscale a 1200px original: more
   * bytes for a softer image. Clamping collapses the oversized candidates
   * onto the real maximum instead.
   */
  const maxWidth = Number(sourceWidth);
  const targetWidth = Math.min(width, maxWidth);

  /*
   * Preserve the source aspect ratio: Wix wants explicit w_ and h_, and
   * passing the requested width against the original height would letterbox
   * or crop every product photo.
   */
  const ratio = Number(sourceHeight) / maxWidth;
  const height = Math.round(targetWidth * ratio);

  return src.replace(
    WIX_IMAGE_PARAMS_RE,
    `/v1/${mode}/w_${targetWidth},h_${height},q_${quality ?? 80}/`
  );
}
