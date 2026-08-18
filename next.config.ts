import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: let phones/other devices on the local network reach the dev
  // server without Next blocking its cross-origin dev/HMR resources (which
  // otherwise loads the HTML but never hydrates, so nothing is tappable)
  allowedDevOrigins: ["10.0.0.66", "10.0.0.*"], //for testing
};

export default nextConfig;
