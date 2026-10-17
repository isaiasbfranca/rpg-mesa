import type { NextConfig } from "next";

/** GitHub Pages: site estático servido em /<repositório>. Fora do Pages o app roda como antes. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = process.env.GITHUB_PAGES
  ? { output: "export", basePath, trailingSlash: true, images: { unoptimized: true } }
  : {};

export default nextConfig;
