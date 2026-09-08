import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: let phones/other devices on the local network reach the dev
  // server without Next blocking its cross-origin dev/HMR resources (which
  // otherwise loads the HTML but never hydrates, so nothing is tappable)
  allowedDevOrigins: ["10.0.0.66", "10.0.0.*","192.168.1.235"], //for testing

  /*
   * The store ran on Wix for years, where every product lived at
   * /product-page/{slug}. Those URLs are what Google indexed and what old
   * social posts and emails still link to, and they 404 here. The slug is the
   * same field on both platforms, so the path prefix is the only difference.
   *
   * 301 rather than a 404 so the existing search ranking transfers to the new
   * URL instead of being dropped and rediscovered from scratch.
   *
   * Kept here rather than in netlify.toml because Next resolves it itself, so
   * it still applies if this ever moves to the Cloudflare Workers setup the
   * repo keeps ready (see netlify.toml).
   */
  async redirects() {
    return [
      {
        source: "/product-page/:slug",
        destination: "/product/:slug",
        statusCode: 301,
      },
    ];
  },

  images: {
    /*
     * Product photos are resized by the Wix media CDN via params in the URL
     * path, not by Next's optimizer — see lib/wix/image-loader.ts for why.
     *
     * A custom loader bypasses /_next/image entirely, so `remotePatterns` is
     * no longer needed: that allowlist only ever gated the optimizer, and
     * nothing now asks it to fetch a remote URL.
     */
    loader: "custom",
    loaderFile: "./lib/wix/image-loader.ts",
  },
};

export default nextConfig;
