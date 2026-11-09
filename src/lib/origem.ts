// Descobre de onde a pessoa veio: link com etiqueta (QR code, campanha) ou site anterior (Google, Instagram...).
export const ORIGENS = ["Google", "Instagram", "WhatsApp", "Facebook", "QR code", "Direto", "Outros sites", "Campanhas", "YouTube", "TikTok", "Outros buscadores"] as const;

type Entrada = { ref: string; host: string; utm_source: string; utm_medium: string; utm_campaign: string; origem: string };

const porNome = (s: string): string | null => {
  const t = s.toLowerCase();
  if (/(^|[^a-z])qr/.test(t)) return "QR code";
  if (t.includes("instagram") || t === "ig") return "Instagram";
  if (t.includes("whats") || t === "wa") return "WhatsApp";
  if (t.includes("facebook") || t === "fb") return "Facebook";
  if (t.includes("google")) return "Google";
  if (t.includes("youtube")) return "YouTube";
  if (t.includes("tiktok")) return "TikTok";
  return null;
};

export function classificarOrigem(e: Entrada): { origem: string; detalhe: string | null } {
  // 1) Links com etiqueta: ?origem=qr-placa-gonzaga ou ?utm_source=instagram&utm_campaign=...
  const etiqueta = e.origem || e.utm_source;
  if (etiqueta) {
    const detalhe = [e.origem || e.utm_campaign || e.utm_source, e.utm_medium].filter(Boolean).join(" · ") || null;
    return { origem: porNome(etiqueta) ?? porNome(e.utm_medium) ?? "Campanhas", detalhe };
  }
  // 2) Site de onde a pessoa clicou.
  let dominio = "";
  try { dominio = e.ref ? new URL(e.ref).hostname.replace(/^www\./, "") : ""; } catch {}
  if (!dominio || dominio === e.host.replace(/^www\./, "")) return { origem: "Direto", detalhe: null };
  if (/(^|\.)google\./.test(dominio)) return { origem: "Google", detalhe: dominio };
  if (/instagram\.com$/.test(dominio)) return { origem: "Instagram", detalhe: dominio };
  if (/(facebook\.com|fb\.me|fb\.com)$/.test(dominio)) return { origem: "Facebook", detalhe: dominio };
  if (/(whatsapp\.com|wa\.me)$/.test(dominio)) return { origem: "WhatsApp", detalhe: dominio };
  if (/(youtube\.com|youtu\.be)$/.test(dominio)) return { origem: "YouTube", detalhe: dominio };
  if (/tiktok\.com$/.test(dominio)) return { origem: "TikTok", detalhe: dominio };
  if (/(bing\.com|yahoo\.|duckduckgo\.com|ecosia\.org)/.test(dominio)) return { origem: "Outros buscadores", detalhe: dominio };
  return { origem: "Outros sites", detalhe: dominio };
}
