// Registra uma página vista (anônimo). A cidade vem da Cloudflare; o IP não é guardado.
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { classificarOrigem } from "@/lib/origem";

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const id = (v: unknown) => (typeof v === "string" && /^[a-z0-9-]{8,40}$/i.test(v) ? v : "");

export async function POST(req: Request) {
  const { env, cf } = await getCloudflareContext({ async: true });
  const d = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const ua = req.headers.get("user-agent") ?? "";
  if (!d || /bot|crawl|spider|preview|headless|lighthouse/i.test(ua)) return new Response(null, { status: 204 });

  const visitante = id(d.visitante), sessao = id(d.sessao);
  const pagina = texto(d.pagina, 200);
  if (!visitante || !sessao || !pagina.startsWith("/") || pagina.startsWith("/painel")) return new Response(null, { status: 204 });

  // Limite contra abuso: no máximo 300 páginas por visita.
  const n = await env.DB.prepare("SELECT count(*) AS n FROM visitas WHERE sessao = ?").bind(sessao).first<{ n: number }>();
  if ((n?.n ?? 0) >= 300) return new Response(null, { status: 204 });

  const { origem, detalhe } = classificarOrigem({
    ref: texto(d.ref, 300), host: new URL(req.url).hostname,
    utm_source: texto(d.utm_source, 60), utm_medium: texto(d.utm_medium, 60), utm_campaign: texto(d.utm_campaign, 80), origem: texto(d.origem, 80),
  });
  const dispositivo = /iPad|Tablet/i.test(ua) ? "Tablet" : /Mobi|Android|iPhone/i.test(ua) ? "Celular" : "Computador";
  const geo = (cf ?? {}) as { city?: string; region?: string; country?: string };

  const insere = env.DB.prepare(
    "INSERT INTO visitas (visitante, sessao, novo, pagina, origem, detalhe, cidade, regiao, pais, dispositivo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).bind(visitante, sessao, d.novo === true ? 1 : 0, pagina, origem, detalhe, geo.city ?? null, geo.region ?? null, geo.country ?? null, dispositivo);
  // De vez em quando apaga visitas com mais de 13 meses (mantém o banco pequeno e gratuito).
  if (Math.random() < 0.01) await env.DB.batch([insere, env.DB.prepare("DELETE FROM visitas WHERE em < datetime('now', '-400 days')")]);
  else await insere.run();
  return new Response(null, { status: 204 });
}
