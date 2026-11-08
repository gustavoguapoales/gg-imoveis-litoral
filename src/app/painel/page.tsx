import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { PainelApp } from "@/components/painel/PainelApp";
import { ambiente, listarTodos } from "@/lib/banco";
import { registrarAcesso, verificarAcesso } from "@/lib/acesso";

// Painel do corretor. Protegido duas vezes: pela Cloudflare Access (login com código no e-mail)
// e aqui no servidor, que confere o token antes de carregar qualquer dado privado.
export const metadata: Metadata = {
  title: "Painel do corretor",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function PaginaPainel() {
  const h = await headers();
  const usuario = await verificarAcesso(h);
  if (!usuario) {
    return (
      <div className="grid min-h-screen place-items-center bg-nevoa px-4">
        <div className="max-w-md rounded-lg border border-linha bg-papel p-8 text-center">
          <h1 className="font-display text-3xl">Acesso restrito</h1>
          <p className="mt-3 text-cinza">Esta área é só para o corretor. Entre pelo endereço do painel para receber o código de acesso no e-mail.</p>
          <Link href="/" className="mt-6 inline-block rounded-full bg-tinta px-6 py-3 text-sm font-medium text-white">Voltar ao site</Link>
        </div>
      </div>
    );
  }
  await registrarAcesso(usuario, h);
  const { DB } = await ambiente();
  const uso = await DB.prepare("SELECT COALESCE(SUM(bytes), 0) AS total FROM fotos").first<{ total: number }>();
  return <PainelApp baseSite="" servidor={{ usuario: usuario.email, registros: await listarTodos(), bytesFotos: uso?.total ?? 0 }} />;
}
