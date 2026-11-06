import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Sem cache incremental: as páginas leem o banco a cada visita (simples e dentro do plano gratuito).
export default defineCloudflareConfig({});
