// Proteção do painel no servidor.
// A Cloudflare Access faz o login (código no e-mail) e envia, em cada requisição, um token assinado
// (cabeçalho Cf-Access-Jwt-Assertion). Aqui conferimos a assinatura, o app, a validade e o e-mail.
// Se qualquer coisa falhar, o acesso é negado (nunca liberamos "por padrão").

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ambiente } from "./banco";

type Chave = JsonWebKey & { kid: string };
let cacheChaves: { chaves: Chave[]; ate: number } | null = null;

const b64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")), (c) => c.charCodeAt(0));

async function chavesPublicas(equipe: string): Promise<Chave[]> {
  if (cacheChaves && cacheChaves.ate > Date.now()) return cacheChaves.chaves;
  const r = await fetch(`https://${equipe}.cloudflareaccess.com/cdn-cgi/access/certs`);
  if (!r.ok) throw new Error("Não foi possível obter as chaves da Cloudflare Access");
  const { keys } = (await r.json()) as { keys: Chave[] };
  cacheChaves = { chaves: keys, ate: Date.now() + 60 * 60 * 1000 };
  return keys;
}

export type Usuario = { email: string; sessao: string };

export async function verificarAcesso(h: Headers): Promise<Usuario | null> {
  const env = (await ambiente()) as CloudflareEnv & { ACESSO_LOCAL?: string };
  // Somente para testes no computador (arquivo .dev.vars, que nunca vai para o GitHub nem para a Cloudflare).
  if (env.ACESSO_LOCAL === "liberado") return { email: env.PAINEL_EMAIL, sessao: "teste-local" };

  const token = h.get("cf-access-jwt-assertion") ?? h.get("cookie")?.match(/(?:^|;\s*)CF_Authorization=([^;]+)/)?.[1];
  if (!token || !env.ACCESS_AUD || !env.ACCESS_EQUIPE) return null;
  try {
    const [cab, corpo, assinatura] = token.split(".");
    const cabecalho = JSON.parse(new TextDecoder().decode(b64url(cab))) as { kid: string; alg: string };
    if (cabecalho.alg !== "RS256") return null;
    const jwk = (await chavesPublicas(env.ACCESS_EQUIPE)).find((k) => k.kid === cabecalho.kid);
    if (!jwk) return null;
    const chave = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const valido = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", chave, b64url(assinatura), new TextEncoder().encode(`${cab}.${corpo}`));
    if (!valido) return null;
    const dados = JSON.parse(new TextDecoder().decode(b64url(corpo))) as { aud: string | string[]; iss: string; exp: number; email?: string; sub?: string; iat?: number };
    const auds = Array.isArray(dados.aud) ? dados.aud : [dados.aud];
    if (!auds.includes(env.ACCESS_AUD)) return null;
    if (dados.iss !== `https://${env.ACCESS_EQUIPE}.cloudflareaccess.com`) return null;
    if (!dados.exp || dados.exp * 1000 < Date.now()) return null;
    if (!dados.email || dados.email.toLowerCase() !== env.PAINEL_EMAIL.toLowerCase()) return null;
    return { email: dados.email, sessao: `${dados.sub ?? dados.email}:${dados.iat ?? 0}` };
  } catch {
    return null;
  }
}

const quando = () =>
  new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "full", timeStyle: "short" });

// Registra o acesso e, se for uma sessão nova, envia o aviso por e-mail.
export async function registrarAcesso(usuario: Usuario, h: Headers): Promise<void> {
  const { env, cf } = await getCloudflareContext({ async: true });
  const ip = h.get("cf-connecting-ip") ?? "desconhecido";
  const local = [cf?.city, cf?.region, cf?.country].filter(Boolean).join(", ") || "local desconhecido";
  const aparelho = h.get("user-agent") ?? "desconhecido";
  const r = await env.DB.prepare("INSERT OR IGNORE INTO acessos (sessao, email, ip, local, aparelho) VALUES (?, ?, ?, ?, ?)")
    .bind(usuario.sessao, usuario.email, ip, local, aparelho).run();
  if (!r.meta.changes || usuario.sessao === "teste-local") return;
  try {
    await env.EMAIL.send({
      from: { name: "Painel GG Imóveis", email: "painel@ggimoveislitoral.com" },
      to: env.PAINEL_EMAIL,
      subject: "Novo acesso ao painel GG Imóveis Litoral",
      text: [
        "Olá, Gustavo.",
        "",
        "Houve um novo acesso ao painel do corretor:",
        `• Quando: ${quando()}`,
        `• Conta: ${usuario.email}`,
        `• Local aproximado: ${local}`,
        `• IP: ${ip}`,
        `• Aparelho/navegador: ${aparelho}`,
        "",
        "Se foi você, não precisa fazer nada.",
        "Se NÃO foi você, entre no painel da Cloudflare (Zero Trust > Usuários) e encerre as sessões, e me avise.",
      ].join("\n"),
    });
  } catch (e) {
    console.error("Falha ao enviar aviso de acesso", e);
  }
}
