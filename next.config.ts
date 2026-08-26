import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: let phones/other devices on the local network reach the dev
  // server without Next blocking its cross-origin dev/HMR resources (which
  // otherwise loads the HTML but never hydrates, so nothing is tappable)
  allowedDevOrigins: ["10.0.0.66", "10.0.0.*","192.168.1.235"], //for testing

  images: {
    // The live Wix catalog serves every product photo from this host. Without
    // it next/image refuses the URL outright and the whole grid errors.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
