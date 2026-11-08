// Acesso ao banco D1. Só roda no servidor (Cloudflare Worker).
// Regra principal: as funções "públicas" leem SOMENTE a coluna `publico`.
// Os dados do proprietário (coluna `privado`) só saem por funções do painel, chamadas por rotas protegidas.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Imovel } from "@/data/imoveis";
import { NO_SITE, type DadosPrivados, type StatusImovel } from "@/data/privado-demo";

export type Registro = { pub: Imovel; priv: DadosPrivados };


export async function ambiente() {
  return (await getCloudflareContext({ async: true })).env;
}

// ---------- Site público ----------

export async function listarPublicos(): Promise<Imovel[]> {
  const { DB } = await ambiente();
  const r = await DB.prepare(
    `SELECT publico FROM imoveis WHERE status IN (${NO_SITE.map(() => "?").join(",")}) ORDER BY criado_em DESC, ordem`, // mais recentes primeiro
  ).bind(...NO_SITE).all<{ publico: string }>();
  return r.results.map((l) => JSON.parse(l.publico) as Imovel);
}

export async function obterPublico(slug: string): Promise<Imovel | null> {
  const { DB } = await ambiente();
  const l = await DB.prepare(`SELECT publico FROM imoveis WHERE slug = ? AND status IN (${NO_SITE.map(() => "?").join(",")})`)
    .bind(slug, ...NO_SITE).first<{ publico: string }>();
  return l ? (JSON.parse(l.publico) as Imovel) : null;
}

// ---------- Painel (somente rotas protegidas) ----------

export async function listarTodos(): Promise<Registro[]> {
  const { DB } = await ambiente();
  const r = await DB.prepare("SELECT status, publico, privado FROM imoveis ORDER BY criado_em DESC, ordem")
    .all<{ status: StatusImovel; publico: string; privado: string }>();
  return r.results.map((l) => ({ pub: JSON.parse(l.publico), priv: { ...JSON.parse(l.privado), status: l.status } }));
}

const slugify = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export async function salvar(r: Registro): Promise<Registro> {
  const { DB } = await ambiente();
  const { status, ...privado } = r.priv;
  const existente = await DB.prepare("SELECT slug FROM imoveis WHERE ref = ?").bind(r.pub.ref).first<{ slug: string }>();
  // Imóvel novo ganha um endereço (slug) a partir do título; o de um imóvel existente nunca muda (preserva links e Google).
  let slug = existente?.slug ?? slugify(`${r.pub.titulo} ${r.pub.cidade}`);
  if (!existente) {
    const repetido = await DB.prepare("SELECT 1 FROM imoveis WHERE slug = ?").bind(slug).first();
    if (repetido) slug = `${slug}-${r.pub.ref.toLowerCase()}`;
  }
  const pub: Imovel = { ...r.pub, slug };
  if (existente) {
    await DB.prepare("UPDATE imoveis SET status = ?, publico = ?, privado = ?, atualizado_em = datetime('now') WHERE ref = ?")
      .bind(status, JSON.stringify(pub), JSON.stringify(privado), pub.ref).run();
  } else {
    await DB.prepare("INSERT INTO imoveis (ref, slug, status, publico, privado, ordem) VALUES (?, ?, ?, ?, ?, -1)")
      .bind(pub.ref, slug, status, JSON.stringify(pub), JSON.stringify(privado)).run();
  }
  return { pub, priv: r.priv };
}

export async function proximaRef(): Promise<string> {
  const { DB } = await ambiente();
  const r = await DB.prepare("SELECT ref FROM imoveis").all<{ ref: string }>();
  const maior = Math.max(200, ...r.results.map((l) => Number(l.ref.replace(/\D/g, "")) || 0));
  return `GG-${String(maior + 1).padStart(4, "0")}`;
}

// Exclui o imóvel e as fotos dele que estão no R2.
export async function remover(ref: string) {
  const { DB, FOTOS } = await ambiente();
  const fotos = await DB.prepare("SELECT chave FROM fotos WHERE ref = ?").bind(ref).all<{ chave: string }>();
  if (fotos.results.length) await FOTOS.delete(fotos.results.map((f) => f.chave));
  await DB.batch([DB.prepare("DELETE FROM fotos WHERE ref = ?").bind(ref), DB.prepare("DELETE FROM imoveis WHERE ref = ?").bind(ref)]);
}
