import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// O site roda na Cloudflare (OpenNext): páginas públicas leem o banco D1
// e o painel do corretor salva imóveis e fotos (R2).
const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

// Dá acesso ao D1, R2 e e-mail locais durante `next dev`.
initOpenNextCloudflareForDev();
