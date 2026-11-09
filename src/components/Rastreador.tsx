"use client";
// Conta as visitas do site de forma anônima (sem nome, sem IP). Não roda no painel.
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const aleatorio = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`);
const ler = (s: Storage, k: string) => { try { return s.getItem(k); } catch { return null; } };
const gravar = (s: Storage, k: string, v: string) => { try { s.setItem(k, v); } catch {} };

// Dados da visita atual: guardados na aba para que todas as páginas carreguem a mesma origem.
export function visitaAtual() {
  if (typeof window === "undefined") return null;
  const salvo = ler(sessionStorage, "gg_visita");
  if (salvo) try { return JSON.parse(salvo) as Record<string, string | boolean>; } catch {}
  let visitante = ler(localStorage, "gg_visitante");
  const novo = !visitante;
  if (!visitante) { visitante = aleatorio(); gravar(localStorage, "gg_visitante", visitante); }
  const q = new URLSearchParams(window.location.search);
  const v = {
    visitante, sessao: aleatorio(), novo, ref: document.referrer,
    origem: q.get("origem") ?? "", utm_source: q.get("utm_source") ?? "", utm_medium: q.get("utm_medium") ?? "", utm_campaign: q.get("utm_campaign") ?? "",
  };
  gravar(sessionStorage, "gg_visita", JSON.stringify(v));
  return v;
}

export function Rastreador() {
  const caminho = usePathname();
  useEffect(() => {
    if (!caminho || caminho.startsWith("/painel")) return;
    const v = visitaAtual();
    if (!v) return;
    const primeira = !ler(sessionStorage, "gg_contou");
    gravar(sessionStorage, "gg_contou", "1");
    fetch("/api/visita/", {
      method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
      body: JSON.stringify({ ...v, novo: primeira && v.novo, pagina: caminho }),
    }).catch(() => {});
  }, [caminho]);
  return null;
}
