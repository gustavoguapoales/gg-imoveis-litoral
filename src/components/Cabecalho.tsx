"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { IconeFechar, IconeMenu, IconeWhatsApp } from "./Icones";
import { linkWhatsApp } from "@/lib/site";

const LINKS = [
  { href: "/imoveis/", rotulo: "Imóveis" },
  { href: "/#regioes", rotulo: "Regiões" },
  { href: "/#atuacao", rotulo: "Atuação" },
  { href: "/#vender", rotulo: "Vender meu imóvel" },
  { href: "/contato/", rotulo: "Contato" },
];

export function Cabecalho() {
  const pathname = usePathname();
  const [rolou, setRolou] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 40);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  const transparente = pathname === "/" && !rolou && !aberto;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        transparente ? "bg-transparent" : "bg-papel/95 shadow-[0_1px_0_var(--color-linha)] backdrop-blur"
      }`}
    >
      <div className="container-site flex h-20 items-center justify-between gap-6">
        <Link href="/" aria-label="GG Imóveis Litoral, página inicial">
          <Logo claro={transparente} />
        </Link>

        <nav className={`hidden items-center gap-8 lg:flex ${transparente ? "text-white" : "text-tinta"}`} aria-label="Principal">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[0.92rem] opacity-85 transition hover:opacity-100 hover:text-latao">
              {l.rotulo}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={linkWhatsApp()}
            target="_blank"
            rel="noopener"
            className="hidden items-center gap-2 rounded-full bg-whats px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110 sm:flex"
          >
            <IconeWhatsApp width={17} height={17} /> WhatsApp
          </a>
          <button
            type="button"
            className={`grid h-11 w-11 place-items-center lg:hidden ${transparente ? "text-white" : "text-tinta"}`}
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={aberto}
            onClick={() => setAberto((v) => !v)}
          >
            {aberto ? <IconeFechar width={24} height={24} /> : <IconeMenu width={24} height={24} />}
          </button>
        </div>
      </div>

      {aberto && (
        <nav className="border-t border-linha bg-papel lg:hidden" aria-label="Menu móvel">
          <ul className="container-site flex flex-col py-4">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setAberto(false)} className="block border-b border-linha py-4 font-display text-2xl">
                  {l.rotulo}
                </Link>
              </li>
            ))}
            <li className="pt-5">
              <a href={linkWhatsApp()} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 rounded-full bg-whats py-3.5 font-medium text-white">
                <IconeWhatsApp /> Falar no WhatsApp
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
