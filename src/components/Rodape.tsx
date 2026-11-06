import Link from "next/link";
import { Logo } from "./Logo";
import { IconeWhatsApp } from "./Icones";
import { SITE, linkWhatsApp } from "@/lib/site";
import { cidades } from "@/data/imoveis";

export function Rodape() {
  return (
    <footer className="bg-tinta text-white/80">
      <div className="container-site grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="max-w-xs">
          <Logo claro />
          <p className="mt-6 text-sm leading-relaxed text-white/60">
            Corretagem de imóveis no litoral paulista, com atendimento próximo do primeiro contato até a escritura.
          </p>
          <p className="rotulo mt-6 text-white/45">{SITE.creci}</p>
        </div>

        <div>
          <p className="rotulo text-latao">Cidades</p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {cidades.map((c) => (
              <li key={c.slug}>
                <Link href={`/imoveis/?cidade=${c.slug}`} className="hover:text-white">
                  Imóveis em {c.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="rotulo text-latao">Navegação</p>
          <ul className="mt-5 space-y-2.5 text-sm">
            <li><Link href="/imoveis/" className="hover:text-white">Todos os imóveis</Link></li>
            <li><Link href="/anunciar/" className="hover:text-white">Anunciar imóvel</Link></li>
            <li><Link href="/avaliacao/" className="hover:text-white">Avaliação gratuita</Link></li>
            <li><Link href="/drone/" className="hover:text-white">Fotos com drone</Link></li>
            <li><Link href="/#atuacao" className="hover:text-white">Como trabalho</Link></li>
            <li><Link href="/contato/" className="hover:text-white">Contato</Link></li>
          </ul>
        </div>

        <div>
          <p className="rotulo text-latao">Atendimento</p>
          <a href={linkWhatsApp()} target="_blank" rel="noopener" className="mt-5 flex items-center gap-2 text-lg text-white hover:text-mar-claro">
            <IconeWhatsApp /> {SITE.whatsappExibicao}
          </a>
          <p className="mt-3 text-sm text-white/60">{SITE.email}</p>
          <p className="mt-1 text-sm text-white/60">{SITE.horario}</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-2 py-6 text-xs text-white/45 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.nome}. Todos os direitos reservados.</p>
          <p>Protótipo: imóveis de exemplo e imagens ilustrativas geradas por IA.</p>
        </div>
      </div>
    </footer>
  );
}
