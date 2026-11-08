// Entrega pública das fotos guardadas no R2 (as fotos dos anúncios são públicas).
// Usa o cache da Cloudflare para não gastar leituras do R2 a cada visita.
import { ambiente } from "@/lib/banco";

export async function GET(req: Request, { params }: { params: Promise<{ chave: string[] }> }) {
  const chave = (await params).chave.join("/");
  if (!/^imoveis\/GG-\d{4,6}\/[\w-]+\.(jpg|png|webp)$/.test(chave)) return new Response("Não encontrado", { status: 404 });
  const cache = (caches as unknown as { default: Cache }).default;
  const emCache = await cache.match(req.url);
  if (emCache) return emCache;
  const { FOTOS } = await ambiente();
  const obj = await FOTOS.get(chave);
  if (!obj) return new Response("Não encontrado", { status: 404 });
  const resp = new Response(obj.body, {
    headers: { "Content-Type": obj.httpMetadata?.contentType ?? "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable", ETag: obj.httpEtag },
  });
  await cache.put(req.url, resp.clone());
  return resp;
}
