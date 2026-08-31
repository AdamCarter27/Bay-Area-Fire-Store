import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: let phones/other devices on the local network reach the dev
  // server without Next blocking its cross-origin dev/HMR resources (which
  // otherwise loads the HTML but never hydrates, so nothing is tappable)
  allowedDevOrigins: ["10.0.0.66", "10.0.0.*","192.168.1.235"], //for testing

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
