// Login do painel por senha.
// - A senha nunca fica no código: só um hash PBKDF2 guardado como segredo na Cloudflare (PAINEL_SENHA_HASH).
// - Ao entrar, o navegador recebe um cookie de sessão assinado (SESSAO_CHAVE), válido por 30 dias,
//   HttpOnly + Secure + SameSite=Strict (não é lido por scripts nem enviado por outros sites).
// - Mais de 5 senhas erradas em 15 minutos no mesmo IP (ou 20 no total em 1 hora) bloqueiam novas tentativas.
// - Cada novo login gera um aviso por e-mail.
// Se qualquer verificação falhar, o acesso é negado.

import { getCloudflareContext } from "@opennextjs/cloudflare";

type Env = CloudflareEnv & { ACESSO_LOCAL?: string; PAINEL_SENHA_HASH?: string; SESSAO_CHAVE?: string };
export type Usuario = { email: string; sessao: string };

export const COOKIE = "gg_painel";
const DURACAO = 30 * 24 * 60 * 60; // 30 dias, em segundos

const env = async () => (await getCloudflareContext({ async: true })).env as Env;
const enc = new TextEncoder();
const b64url = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const deB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")), (c) => c.charCodeAt(0));

function iguais(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}

async function assinar(texto: string, chave: string) {
  const k = await crypto.subtle.importKey("raw", deB64url(chave), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", k, enc.encode(texto)));
}

export async function senhaCorreta(senha: string): Promise<boolean> {
  const { PAINEL_SENHA_HASH } = await env();
  const [alg, it, sal, hash] = (PAINEL_SENHA_HASH ?? "").split("$");
  if (alg !== "pbkdf2-sha256" || !it || !sal || !hash || !senha) return false;
  const base = await crypto.subtle.importKey("raw", enc.encode(senha), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: deB64url(sal), iterations: Number(it) }, base, 256);
  return iguais(new Uint8Array(bits), deB64url(hash));
}

// Cookie: "<id da sessão>.<expira em>.<assinatura>"
export async function criarCookieSessao(): Promise<{ valor: string; sessao: string }> {
  const { SESSAO_CHAVE } = await env();
  if (!SESSAO_CHAVE) throw new Error("SESSAO_CHAVE não configurada");
  const sessao = crypto.randomUUID();
  const exp = Math.floor(Date.now() / 1000) + DURACAO;
  const dados = `${sessao}.${exp}`;
  const valor = `${dados}.${await assinar(dados, SESSAO_CHAVE)}`;
  return { sessao, valor: `${COOKIE}=${valor}; Path=/; Max-Age=${DURACAO}; HttpOnly; Secure; SameSite=Strict` };
}
export const cookieSair = () => `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;

export async function verificarAcesso(h: Headers): Promise<Usuario | null> {
  const e = await env();
  // Somente para testes no computador (arquivo .dev.vars, que nunca vai para o GitHub nem para a Cloudflare).
  if (e.ACESSO_LOCAL === "liberado") return { email: e.PAINEL_EMAIL, sessao: "teste-local" };
  if (!e.SESSAO_CHAVE) return null;
  const valor = h.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))?.[1];
  if (!valor) return null;
  const [sessao, exp, assinatura] = valor.split(".");
  if (!sessao || !exp || !assinatura || Number(exp) * 1000 < Date.now()) return null;
  const esperada = await assinar(`${sessao}.${exp}`, e.SESSAO_CHAVE);
  if (!iguais(enc.encode(esperada), enc.encode(assinatura))) return null;
  return { email: e.PAINEL_EMAIL, sessao };
}

// ---------- Bloqueio de tentativas ----------
export async function bloqueado(ip: string): Promise<boolean> {
  const { DB } = await env();
  const r = await DB.prepare(
    `SELECT
       (SELECT count(*) FROM tentativas WHERE ip = ? AND em > datetime('now', '-15 minutes')) AS doIp,
       (SELECT count(*) FROM tentativas WHERE em > datetime('now', '-60 minutes')) AS total`,
  ).bind(ip).first<{ doIp: number; total: number }>();
  return (r?.doIp ?? 0) >= 5 || (r?.total ?? 0) >= 20;
}
export async function registrarErro(ip: string) {
  const { DB } = await env();
  await DB.batch([
    DB.prepare("INSERT INTO tentativas (ip) VALUES (?)").bind(ip),
    DB.prepare("DELETE FROM tentativas WHERE em < datetime('now', '-1 day')"),
  ]);
}

// ---------- Aviso por e-mail ----------
const quando = () => new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "full", timeStyle: "short" });

export async function registrarAcesso(usuario: Usuario, h: Headers): Promise<void> {
  const { env: e, cf } = await getCloudflareContext({ async: true });
  const ip = h.get("cf-connecting-ip") ?? "desconhecido";
  const local = [cf?.city, cf?.region, cf?.country].filter(Boolean).join(", ") || "local desconhecido";
  const aparelho = h.get("user-agent") ?? "desconhecido";
  const r = await e.DB.prepare("INSERT OR IGNORE INTO acessos (sessao, email, ip, local, aparelho) VALUES (?, ?, ?, ?, ?)")
    .bind(usuario.sessao, usuario.email, ip, local, aparelho).run();
  if (!r.meta.changes || usuario.sessao === "teste-local") return;
  try {
    await e.EMAIL.send({
      from: { name: "Painel GG Imóveis", email: "painel@ggimoveislitoral.com" },
      to: e.PAINEL_EMAIL,
      subject: "Novo acesso ao painel GG Imóveis Litoral",
      text: [
        "Olá, Gustavo.",
        "",
        "Houve um novo login no painel do corretor:",
        `• Quando: ${quando()}`,
        `• Local aproximado: ${local}`,
        `• IP: ${ip}`,
        `• Aparelho/navegador: ${aparelho}`,
        "",
        "Se foi você, não precisa fazer nada.",
        "Se NÃO foi você, troque a senha do painel o quanto antes.",
      ].join("\n"),
    });
  } catch (erro) {
    console.error("Falha ao enviar aviso de acesso", erro);
  }
}
