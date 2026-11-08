// Login do painel por senha (formulário da página /painel).
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { bloqueado, criarCookieSessao, registrarAcesso, registrarErro, senhaCorreta } from "@/lib/acesso";

// Redirecionamento relativo: funciona em qualquer endereço do site.
const voltar = (erro?: string) => new Response(null, { status: 303, headers: { Location: `/painel/${erro ? `?erro=${erro}` : ""}` } });

export async function POST(req: Request) {
  const ip = req.headers.get("cf-connecting-ip") ?? "local";
  if (await bloqueado(ip)) return voltar("bloqueado");
  const form = await req.formData().catch(() => null);
  const senha = String(form?.get("senha") ?? "");
  if (!(await senhaCorreta(senha))) {
    await registrarErro(ip);
    return voltar((await bloqueado(ip)) ? "bloqueado" : "senha");
  }
  const { valor, sessao } = await criarCookieSessao();
  const { env } = await getCloudflareContext({ async: true });
  await registrarAcesso({ email: env.PAINEL_EMAIL, sessao }, req.headers);
  const r = voltar();
  r.headers.set("Set-Cookie", valor);
  return r;
}
