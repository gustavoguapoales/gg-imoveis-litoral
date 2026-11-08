import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { PainelApp } from "@/components/painel/PainelApp";
import { ambiente, listarTodos } from "@/lib/banco";
import { verificarAcesso } from "@/lib/acesso";

// Painel do corretor: protegido por senha. O servidor confere a sessão antes de carregar qualquer dado privado.
export const metadata: Metadata = {
  title: "Painel do corretor",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const MENSAGENS: Record<string, string> = {
  senha: "Senha incorreta. Tente de novo.",
  bloqueado: "Muitas tentativas erradas. Por segurança, o acesso ficou bloqueado por 15 minutos.",
};

export default async function PaginaPainel({ searchParams }: PageProps<"/painel">) {
  const h = await headers();
  const usuario = await verificarAcesso(h);
  if (!usuario) {
    const erro = MENSAGENS[String((await searchParams).erro ?? "")];
    return (
      <div className="grid min-h-screen place-items-center bg-nevoa px-4 py-10">
        <div className="w-full max-w-md rounded-lg border border-linha bg-papel p-8 shadow-[0_30px_60px_-30px_rgba(4,34,43,0.35)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marca/logo.png" alt="GG Imóveis Litoral" className="h-16 w-auto" />
          <h1 className="mt-6 font-display text-3xl">Painel do corretor</h1>
          <p className="mt-2 text-sm text-cinza">Área restrita. Digite a senha para entrar.</p>
          <form method="post" action="/api/painel/entrar/" className="mt-8 grid gap-4">
            <label htmlFor="senha" className="grid gap-2 text-sm">
              Senha
              <input id="senha" name="senha" type="password" required autoFocus autoComplete="current-password" className="rounded-sm border border-linha bg-papel px-4 py-3 outline-none focus:border-mar" />
            </label>
            {erro && <p className="text-sm text-rose-700" role="alert">{erro}</p>}
            <button className="rounded-full bg-tinta py-3.5 font-medium text-white hover:bg-mar">Entrar</button>
          </form>
          <p className="mt-6 text-xs text-cinza">Cada login gera um aviso no e-mail do corretor.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-mar underline">Voltar ao site</Link>
        </div>
      </div>
    );
  }
  const { DB } = await ambiente();
  const uso = await DB.prepare("SELECT COALESCE(SUM(bytes), 0) AS total FROM fotos").first<{ total: number }>();
  return <PainelApp baseSite="" servidor={{ usuario: usuario.email, registros: await listarTodos(), bytesFotos: uso?.total ?? 0 }} />;
}
