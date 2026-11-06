"use client";

import { usePathname } from "next/navigation";

// Esconde partes do site público (cabeçalho, rodapé, botões flutuantes) dentro do painel do corretor.
export function SomenteSite({ children }: { children: React.ReactNode }) {
  const caminho = usePathname();
  return caminho?.startsWith("/painel") ? null : <>{children}</>;
}
