"use client";
// Cria links e QR codes com etiqueta: quando alguém entra por eles, o painel mostra exatamente de onde veio.
import { useEffect, useState } from "react";
import QRCode from "qrcode";

const SUGESTOES = ["qr-placa", "qr-cartao-de-visita", "instagram-bio", "whatsapp-status", "qr-panfleto"];
const limpar = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

export function GeradorQR({ site }: { site: string }) {
  const [nome, setNome] = useState("qr-placa");
  const [caminho, setCaminho] = useState("/");
  const [qr, setQr] = useState("");
  const [copiado, setCopiado] = useState(false);
  const etiqueta = limpar(nome) || "qr";
  const link = `${site}${caminho.startsWith("/") ? caminho : `/${caminho}`}?origem=${etiqueta}`;

  useEffect(() => {
    QRCode.toDataURL(link, { width: 720, margin: 2, color: { dark: "#04222b", light: "#ffffff" } }).then(setQr).catch(() => setQr(""));
  }, [link]);

  return (
    <section className="rounded-lg border border-linha bg-papel p-5">
      <h2 className="text-sm font-semibold">Criar link ou QR code rastreável</h2>
      <p className="mt-1 text-sm text-cinza">Use um nome diferente para cada lugar (placa, cartão, Instagram). As visitas aparecem com esse nome no painel.</p>
      <div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto]">
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">Nome (onde vai usar)
            <input value={nome} onChange={(e) => setNome(e.target.value)} className="rounded-sm border border-linha bg-white px-3 py-2.5 outline-none focus:border-mar" />
          </label>
          <div className="flex flex-wrap gap-2">
            {SUGESTOES.map((s) => <button key={s} type="button" onClick={() => setNome(s)} className="rounded-full border border-linha px-3 py-1 text-xs hover:border-mar">{s}</button>)}
          </div>
          <label className="grid gap-1 text-sm">Página de destino (opcional, ex.: /imoveis/nome-do-imovel/)
            <input value={caminho} onChange={(e) => setCaminho(e.target.value || "/")} className="rounded-sm border border-linha bg-white px-3 py-2.5 outline-none focus:border-mar" />
          </label>
          <p className="break-all rounded-sm bg-nevoa px-3 py-2 font-mono text-xs">{link}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { navigator.clipboard?.writeText(link); setCopiado(true); setTimeout(() => setCopiado(false), 1500); }} className="rounded-full bg-tinta px-5 py-2.5 text-sm font-medium text-white hover:bg-mar">{copiado ? "Copiado!" : "Copiar link"}</button>
            {qr && <a href={qr} download={`qrcode-${etiqueta}.png`} className="rounded-full border border-tinta/25 px-5 py-2.5 text-sm font-medium hover:border-tinta">Baixar QR code</a>}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {qr && <img src={qr} alt={`QR code para ${link}`} className="h-44 w-44 justify-self-center rounded-md border border-linha" />}
      </div>
    </section>
  );
}
