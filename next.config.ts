import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build plain HTML/CSS/JS into the "out" folder (Capacitor needs this).
  output: "export",
  // The image optimiser needs a server, which a phone app doesn't have.
  images: { unoptimized: true },
};

export default nextConfig;