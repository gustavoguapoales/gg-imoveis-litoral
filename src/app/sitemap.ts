import type { MetadataRoute } from "next";
import { imoveis } from "@/data/imoveis";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/`, priority: 1 },
    { url: `${SITE.url}/imoveis/`, priority: 0.9 },
    { url: `${SITE.url}/anunciar/`, priority: 0.7 },
    { url: `${SITE.url}/avaliacao/`, priority: 0.7 },
    { url: `${SITE.url}/drone/`, priority: 0.6 },
    { url: `${SITE.url}/contato/`, priority: 0.6 },
    ...imoveis.map((i) => ({ url: `${SITE.url}/imoveis/${i.slug}/`, priority: 0.8 })),
  ];
}
