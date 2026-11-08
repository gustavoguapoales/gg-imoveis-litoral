"use client";

/* eslint-disable @next/next/no-img-element */
// PROTÓTIPO do painel do corretor. Sem servidor: os dados vêm de exemplos e as alterações
// ficam só neste navegador. A versão real (modo servidor) usa senha e o banco Cloudflare D1.

import { useEffect, useMemo, useState } from "react";
import type { Cidade, Finalidade, Imovel, Tipo } from "@/data/imoveis";
import { cidades, tipos } from "@/data/imoveis";
import { LOCAIS_CHAVES, STATUS, type DadosPrivados, type StatusImovel } from "@/data/privado-demo";
import { precoImovel } from "@/lib/site";
import { IconeChevron, IconeFechar, IconeLupa, IconeWhatsApp } from "../Icones";

type Registro = { pub: Imovel; priv: DadosPrivados };
// Modo servidor: dados vêm do banco (D1) e são salvos pela API protegida. Sem isso, é o protótipo local.
export type DadosServidor = { usuario: string; registros: Registro[]; bytesFotos: number };
const LIMITE_FOTOS = 8 * 1024 ** 3;
const mb = (b: number) => (b / 1024 ** 2).toLocaleString("pt-BR", { maximumFractionDigits: 1 });

// Reduz a foto no próprio aparelho antes de enviar (máx. 1600 px, JPEG): ~300 KB por foto.
async function reduzirFoto(arquivo: File): Promise<Blob> {
  const bmp = await createImageBitmap(arquivo);
  const escala = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const tela = document.createElement("canvas");
  tela.width = Math.round(bmp.width * escala);
  tela.height = Math.round(bmp.height * escala);
  tela.getContext("2d")!.drawImage(bmp, 0, 0, tela.width, tela.height);
  return new Promise((ok, falha) => tela.toBlob((b) => (b ? ok(b) : falha(new Error("Falha ao reduzir a foto"))), "image/jpeg", 0.82));
}
const CHAVE_LOCAL = "gg-painel-prototipo-v1";

// Na prévia as fotos chegam embutidas; no site, pelo caminho normal.
const foto = (src: string) => {
  const mapa = (globalThis as { __IMG?: Record<string, string> }).__IMG;
  const nome = src.match(/([\w-]+)\.(jpg|png)$/)?.[1];
  const chave = src.startsWith("/marca/") ? `marca-${nome}` : nome;
  return (mapa && chave && mapa[chave]) || src;
};

const COR_STATUS: Record<StatusImovel, string> = {
  Disponível: "bg-emerald-100 text-emerald-800",
  Reservado: "bg-amber-100 text-amber-800",
  Vendido: "bg-slate-200 text-slate-700",
  Alugado: "bg-sky-100 text-sky-800",
  Suspenso: "bg-rose-100 text-rose-800",
};

const hoje = () => new Date(new Date().toDateString());
const diasAte = (iso: string) => (iso ? Math.round((new Date(iso + "T00:00:00").getTime() - hoje().getTime()) / 86400000) : NaN);
const dataBR = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "");
const soDigitos = (t: string) => t.replace(/\D/g, "");
const whatsDe = (tel: string) => `https://wa.me/55${soDigitos(tel)}`;

function Exclusividade({ p }: { p: DadosPrivados }) {
  if (!p.exclusividade || !p.exclusividadeAte) return <span className="text-cinza">Sem exclusividade</span>;
  const d = diasAte(p.exclusividadeAte);
  if (d < 0) return <span className="font-medium text-rose-700">Vencida em {dataBR(p.exclusividadeAte)}</span>;
  if (d <= 30) return <span className="font-medium text-amber-700">Vence em {d} {d === 1 ? "dia" : "dias"}</span>;
  return <span>Até {dataBR(p.exclusividadeAte)}</span>;
}

// ---------- Login de demonstração ----------
function Login({ aoEntrar }: { aoEntrar: (email: string) => void }) {
  const [etapa, setEtapa] = useState<"email" | "codigo">("email");
  const [email, setEmail] = useState("gustavo.guapo70@gmail.com");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  return (
    <div className="grid min-h-screen place-items-center bg-nevoa px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-linha bg-papel p-8 shadow-[0_30px_60px_-30px_rgba(4,34,43,0.35)]">
        <img src={foto("/marca/logo.png")} data-marca="logo" alt="GG Imóveis Litoral" className="h-16 w-auto" />
        <h1 className="mt-6 font-display text-3xl">Painel do corretor</h1>
        <p className="mt-2 text-sm text-cinza">Área restrita. Os dados dos proprietários não aparecem no site público.</p>
        {etapa === "email" ? (
          <form className="mt-8 grid gap-4" onSubmit={(e) => { e.preventDefault(); if (!email.includes("@")) return setErro("Informe um e-mail válido."); setErro(""); setEtapa("codigo"); }}>
            <label htmlFor="login-email" className="grid gap-2 text-sm">E-mail
              <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-sm border border-linha bg-papel px-4 py-3 outline-none focus:border-mar" />
            </label>
            {erro && <p className="text-sm text-rose-700" role="alert">{erro}</p>}
            <button className="rounded-full bg-tinta py-3.5 font-medium text-white hover:bg-mar">Enviar código de acesso</button>
          </form>
        ) : (
          <form className="mt-8 grid gap-4" onSubmit={(e) => { e.preventDefault(); if (soDigitos(codigo).length !== 6) return setErro("O código tem 6 números."); aoEntrar(email); }}>
            <p className="text-sm">Enviamos um código para <strong>{email}</strong>.</p>
            <label htmlFor="login-codigo" className="grid gap-2 text-sm">Código de 6 números
              <input id="login-codigo" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={codigo} onChange={(e) => setCodigo(soDigitos(e.target.value))} placeholder="000000" className="rounded-sm border border-linha bg-papel px-4 py-3 text-center text-xl tracking-[0.4em] outline-none focus:border-mar" />
            </label>
            {erro && <p className="text-sm text-rose-700" role="alert">{erro}</p>}
            <button className="rounded-full bg-tinta py-3.5 font-medium text-white hover:bg-mar">Entrar</button>
            <button type="button" onClick={() => { setEtapa("email"); setErro(""); }} className="text-sm text-mar underline">Trocar e-mail</button>
          </form>
        )}
        <p className="mt-8 rounded-sm bg-latao/15 p-3 text-xs leading-relaxed text-tinta/80">
          <strong>Protótipo:</strong> qualquer código de 6 números entra. Na versão final o acesso é feito pela Cloudflare Access e só os e-mails autorizados recebem o código.
        </p>
      </div>
    </div>
  );
}

// ---------- Campos do formulário ----------
const inp = "w-full rounded-sm border border-linha bg-papel px-3.5 py-2.5 text-sm text-tinta outline-none focus:border-mar";
function Campo({ id, rotulo, children, largo }: { id: string; rotulo: string; children: React.ReactNode; largo?: boolean }) {
  return (
    <label htmlFor={id} className={`grid content-start gap-1.5 text-xs font-medium text-cinza ${largo ? "sm:col-span-2" : ""}`}>
      {rotulo}
      {children}
    </label>
  );
}

// ---------- Ficha do imóvel (editar / novo) ----------
function Ficha({ inicial, novo, baseSite, siteHash, servidor, aoSalvar, aoExcluir, aoFechar }: {
  inicial: Registro; novo: boolean; baseSite: string; siteHash?: boolean; servidor?: boolean;
  aoSalvar: (r: Registro) => Promise<string | null>; aoExcluir: (r: Registro) => Promise<string | null>; aoFechar: () => void;
}) {
  const [r, setR] = useState<Registro>(inicial);
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState("");
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const pub = <K extends keyof Imovel>(k: K, v: Imovel[K]) => setR((x) => ({ ...x, pub: { ...x.pub, [k]: v } }));
  const priv = <K extends keyof DadosPrivados>(k: K, v: DadosPrivados[K]) => setR((x) => ({ ...x, priv: { ...x.priv, [k]: v } }));
  const num = (v: string) => Number(soDigitos(v)) || 0;

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && aoFechar();
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [aoFechar]);

  async function adicionarFotos(arquivos: FileList | null) {
    if (!arquivos) return;
    if (servidor) {
      const lista = Array.from(arquivos).slice(0, 10);
      for (const [k, f] of lista.entries()) {
        setOcupado(`Enviando foto ${k + 1} de ${lista.length}…`);
        try {
          const dados = new FormData();
          dados.set("ref", r.pub.ref);
          dados.set("foto", new File([await reduzirFoto(f)], "foto.jpg", { type: "image/jpeg" }));
          const resp = await fetch("/api/painel/fotos/", { method: "POST", body: dados });
          const json = (await resp.json()) as { url?: string; erro?: string };
          if (!resp.ok || !json.url) { setErro(json.erro ?? "Não foi possível enviar a foto."); break; }
          setR((x) => ({ ...x, pub: { ...x.pub, imagens: [...x.pub.imagens, json.url!] } }));
        } catch {
          setErro("Não foi possível enviar a foto. Verifique a internet e tente de novo.");
          break;
        }
      }
      setOcupado("");
      return;
    }
    Array.from(arquivos).slice(0, 10).forEach((f) => {
      const leitor = new FileReader();
      leitor.onload = () => setR((x) => ({ ...x, pub: { ...x.pub, imagens: [...x.pub.imagens, String(leitor.result)] } }));
      leitor.readAsDataURL(f);
    });
  }

  async function salvar() {
    if (!r.pub.titulo.trim() || !r.pub.bairro.trim() || !r.pub.preco) return setErro("Preencha pelo menos título, bairro e preço.");
    if (!r.priv.proprietario.trim() || !r.priv.telefone.trim()) return setErro("Preencha o nome e o telefone do proprietário.");
    setErro("");
    setOcupado("Salvando…");
    const falha = await aoSalvar(r);
    setOcupado("");
    if (falha) setErro(falha);
  }

  async function excluir() {
    setOcupado("Excluindo…");
    const falha = await aoExcluir(r);
    setOcupado("");
    if (falha) setErro(falha);
  }

  function removerFoto(k: number) {
    const src = r.pub.imagens[k];
    pub("imagens", r.pub.imagens.filter((_, j) => j !== k));
    // Foto enviada pelo painel: apaga do armazenamento para liberar espaço.
    if (servidor && src.startsWith("/midia/")) fetch(`/api/painel/fotos/?chave=${encodeURIComponent(src.slice(7))}`, { method: "DELETE" }).catch(() => {});
  }

  const linkSite = siteHash ? `${baseSite}#${r.pub.slug}` : `${baseSite}/imoveis/${r.pub.slug}/`;
  const endereco = [r.priv.endereco, r.priv.complemento, r.pub.bairro, r.pub.cidade, "SP"].filter(Boolean).join(", ");

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-tinta/50" role="dialog" aria-modal="true" aria-label={novo ? "Novo imóvel" : `Ficha do imóvel ${r.pub.ref}`} onClick={(e) => e.target === e.currentTarget && aoFechar()}>
      <div className="flex h-full w-full max-w-5xl flex-col bg-papel shadow-2xl">
        <div className="flex items-center gap-4 border-b border-linha px-5 py-4 md:px-8">
          <div className="min-w-0 flex-1">
            <p className="rotulo text-latao-escuro">{novo ? "Novo imóvel" : `Ref ${r.pub.ref}`}</p>
            <h2 className="truncate font-display text-xl md:text-2xl">{r.pub.titulo || "Sem título"}</h2>
          </div>
          <select aria-label="Status" value={r.priv.status} onChange={(e) => priv("status", e.target.value as StatusImovel)} className={`rounded-full px-3 py-1.5 text-sm font-semibold outline-none ${COR_STATUS[r.priv.status]}`}>
            {STATUS.map((s) => (<option key={s}>{s}</option>))}
          </select>
          <button type="button" onClick={aoFechar} aria-label="Fechar ficha" className="grid h-10 w-10 place-items-center rounded-full hover:bg-nevoa"><IconeFechar width={22} height={22} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* PRIVADO */}
            <section className="rounded-lg border border-latao/50 bg-latao/[0.07] p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-xl">Dados privados</h3>
                <span className="rounded-full bg-tinta px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-white">Só você vê</span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Campo id="f-end" rotulo="Endereço (rua e número)" largo><input id="f-end" className={inp} value={r.priv.endereco} onChange={(e) => priv("endereco", e.target.value)} placeholder="Ex.: Av. Ana Costa, 500" /></Campo>
                <Campo id="f-comp" rotulo="Complemento (apto, bloco)"><input id="f-comp" className={inp} value={r.priv.complemento} onChange={(e) => priv("complemento", e.target.value)} /></Campo>
                <Campo id="f-cep" rotulo="CEP"><input id="f-cep" className={inp} value={r.priv.cep} onChange={(e) => priv("cep", e.target.value)} /></Campo>
                <Campo id="f-prop" rotulo="Proprietário" largo><input id="f-prop" className={inp} value={r.priv.proprietario} onChange={(e) => priv("proprietario", e.target.value)} /></Campo>
                <Campo id="f-tel" rotulo="Telefone / WhatsApp"><input id="f-tel" type="tel" className={inp} value={r.priv.telefone} onChange={(e) => priv("telefone", e.target.value)} /></Campo>
                <Campo id="f-mail" rotulo="E-mail"><input id="f-mail" type="email" className={inp} value={r.priv.email} onChange={(e) => priv("email", e.target.value)} /></Campo>
                <Campo id="f-chaves" rotulo="Chaves"><select id="f-chaves" className={inp} value={r.priv.chaves} onChange={(e) => priv("chaves", e.target.value)}>{LOCAIS_CHAVES.map((c) => (<option key={c}>{c}</option>))}</select></Campo>
                <Campo id="f-chobs" rotulo="Detalhe das chaves"><input id="f-chobs" className={inp} value={r.priv.chavesObs} onChange={(e) => priv("chavesObs", e.target.value)} placeholder="Ex.: retirar com o zelador" /></Campo>
                <Campo id="f-com" rotulo="Comissão combinada"><input id="f-com" className={inp} value={r.priv.comissao} onChange={(e) => priv("comissao", e.target.value)} /></Campo>
                <Campo id="f-capt" rotulo="Captado em"><input id="f-capt" type="date" className={inp} value={r.priv.captadoEm} onChange={(e) => priv("captadoEm", e.target.value)} /></Campo>
                <div className="grid gap-2 sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium" htmlFor="f-excl">
                    <input id="f-excl" type="checkbox" className="h-4 w-4 accent-mar" checked={r.priv.exclusividade} onChange={(e) => priv("exclusividade", e.target.checked)} /> Tenho exclusividade
                  </label>
                  {r.priv.exclusividade && (
                    <Campo id="f-excl-ate" rotulo="Exclusividade válida até"><input id="f-excl-ate" type="date" className={inp} value={r.priv.exclusividadeAte} onChange={(e) => priv("exclusividadeAte", e.target.value)} /></Campo>
                  )}
                </div>
                <Campo id="f-obs" rotulo="Observações internas" largo><textarea id="f-obs" rows={4} className={inp} value={r.priv.observacoes} onChange={(e) => priv("observacoes", e.target.value)} placeholder="Condições de negociação, horários de visita, histórico..." /></Campo>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {r.priv.telefone && (<a href={whatsDe(r.priv.telefone)} target="_blank" rel="noopener" className="flex items-center gap-1.5 rounded-full bg-whats px-4 py-2 text-sm font-medium text-white"><IconeWhatsApp width={16} height={16} /> WhatsApp do proprietário</a>)}
                {r.priv.endereco && (<a href={`https://www.google.com/maps/search/${encodeURIComponent(endereco)}`} target="_blank" rel="noopener" className="rounded-full border border-tinta/25 px-4 py-2 text-sm font-medium hover:border-tinta">Abrir no mapa</a>)}
              </div>
            </section>

            {/* PÚBLICO */}
            <section className="rounded-lg border border-linha p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-xl">Dados do anúncio</h3>
                <span className="rounded-full bg-nevoa px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-mar">Aparece no site</span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Campo id="f-tit" rotulo="Título do anúncio" largo><input id="f-tit" className={inp} value={r.pub.titulo} onChange={(e) => pub("titulo", e.target.value)} /></Campo>
                <Campo id="f-fin" rotulo="Finalidade"><select id="f-fin" className={inp} value={r.pub.finalidade} onChange={(e) => pub("finalidade", e.target.value as Finalidade)}><option value="venda">Venda</option><option value="aluguel">Aluguel</option></select></Campo>
                <Campo id="f-tipo" rotulo="Tipo"><select id="f-tipo" className={inp} value={r.pub.tipo} onChange={(e) => pub("tipo", e.target.value as Tipo)}>{tipos.map((t) => (<option key={t}>{t}</option>))}</select></Campo>
                <Campo id="f-cid" rotulo="Cidade"><select id="f-cid" className={inp} value={r.pub.cidade} onChange={(e) => pub("cidade", e.target.value as Cidade)}>{cidades.map((c) => (<option key={c.slug}>{c.nome}</option>))}</select></Campo>
                <Campo id="f-bai" rotulo="Bairro"><input id="f-bai" className={inp} value={r.pub.bairro} onChange={(e) => pub("bairro", e.target.value)} /></Campo>
                <Campo id="f-preco" rotulo={r.pub.finalidade === "aluguel" ? "Aluguel mensal (R$)" : "Preço de venda (R$)"}><input id="f-preco" inputMode="numeric" className={inp} value={r.pub.preco ? r.pub.preco.toLocaleString("pt-BR") : ""} onChange={(e) => pub("preco", num(e.target.value))} /></Campo>
                <Campo id="f-cond" rotulo="Condomínio (R$/mês)"><input id="f-cond" inputMode="numeric" className={inp} value={r.pub.condominio ? r.pub.condominio.toLocaleString("pt-BR") : ""} onChange={(e) => pub("condominio", num(e.target.value) || undefined)} /></Campo>
                <div className="grid grid-cols-3 gap-3 sm:col-span-2 sm:grid-cols-6">
                  {([["area", "m²"], ["dormitorios", "Dorm."], ["suites", "Suítes"], ["banheiros", "Banh."], ["vagas", "Vagas"], ["distanciaPraia", "Praia (m)"]] as const).map(([k, rot]) => (
                    <Campo key={k} id={`f-${k}`} rotulo={rot}><input id={`f-${k}`} inputMode="numeric" className={inp} value={String(r.pub[k] ?? "")} onChange={(e) => pub(k, num(e.target.value))} /></Campo>
                  ))}
                </div>
                <label htmlFor="f-vista" className="flex items-center gap-2 text-sm font-medium"><input id="f-vista" type="checkbox" className="h-4 w-4 accent-mar" checked={r.pub.vistaMar} onChange={(e) => pub("vistaMar", e.target.checked)} /> Vista para o mar</label>
                <label htmlFor="f-destaque" className="flex items-center gap-2 text-sm font-medium"><input id="f-destaque" type="checkbox" className="h-4 w-4 accent-mar" checked={r.pub.destaque} onChange={(e) => pub("destaque", e.target.checked)} /> Destaque na página inicial</label>
                <Campo id="f-desc" rotulo="Descrição" largo><textarea id="f-desc" rows={5} className={inp} value={r.pub.descricao.join("\n\n")} onChange={(e) => pub("descricao", e.target.value.split(/\n\s*\n/))} /></Campo>
                <div className="grid gap-2 sm:col-span-2">
                  <p className="text-xs font-medium text-cinza">Fotos ({r.pub.imagens.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {r.pub.imagens.map((src, k) => (
                      <div key={k} className="group relative h-16 w-24 overflow-hidden rounded-sm bg-nevoa">
                        <img src={foto(src)} alt="" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => removerFoto(k)} aria-label={`Remover foto ${k + 1}`} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-tinta/80 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"><IconeFechar width={12} height={12} /></button>
                      </div>
                    ))}
                    <label htmlFor="f-fotos" className="grid h-16 w-24 cursor-pointer place-items-center rounded-sm border border-dashed border-mar text-xs font-medium text-mar hover:bg-nevoa">+ Fotos
                      <input id="f-fotos" type="file" accept="image/*" multiple className="sr-only" onChange={(e) => adicionarFotos(e.target.files)} />
                    </label>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-linha px-5 py-3 md:px-8 md:py-4">
          {!novo && (confirmarExclusao ? (
            <span className="flex basis-full items-center gap-2 text-sm sm:basis-auto">
              <span className="text-rose-700">Excluir de vez, com as fotos?</span>
              <button type="button" onClick={excluir} className="rounded-full bg-rose-700 px-4 py-2 text-xs font-semibold text-white">Sim, excluir</button>
              <button type="button" onClick={() => setConfirmarExclusao(false)} className="text-xs underline">Não</button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirmarExclusao(true)} className="text-xs font-medium text-rose-700 underline">Excluir imóvel</button>
          ))}
          {ocupado ? <p className="basis-full text-sm text-mar sm:basis-auto sm:flex-1" role="status">{ocupado}</p> : erro ? <p className="basis-full text-sm text-rose-700 sm:basis-auto sm:flex-1" role="alert">{erro}</p> : (
            <p className="basis-full text-xs text-cinza sm:basis-auto sm:flex-1">{novo ? "O imóvel novo aparece no site depois de salvo." : <a href={linkSite} target="_blank" rel="noopener" className="text-mar underline">Ver anúncio no site</a>}</p>
          )}
          <button type="button" onClick={aoFechar} className="flex-1 rounded-full border border-tinta/25 px-6 py-3 text-sm font-medium hover:border-tinta sm:flex-none">Cancelar</button>
          <button type="button" onClick={salvar} disabled={!!ocupado} className="disabled:opacity-60 flex-[2] rounded-full bg-tinta px-7 py-3 text-sm font-semibold text-white hover:bg-mar sm:flex-none">Salvar alterações</button>
        </div>
      </div>
    </div>
  );
}

function Tile({ rotulo, valor, destaque }: { rotulo: string; valor: number; destaque?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${destaque && valor ? "border-amber-300 bg-amber-50" : "border-linha bg-papel"}`}>
      <p className="text-xs text-cinza">{rotulo}</p>
      <p className={`mt-1 text-3xl font-semibold tabular-nums ${destaque && valor ? "text-amber-800" : ""}`}>{valor}</p>
    </div>
  );
}

// ---------- Painel ----------
// siteHash: na prévia, o site é um arquivo único com navegação por # (ex.: base#slug).
export function PainelApp({ imoveis = [], privados = {}, baseSite, siteHash, servidor }: {
  imoveis?: Imovel[]; privados?: Record<string, DadosPrivados>; baseSite: string; siteHash?: boolean; servidor?: DadosServidor;
}) {
  const inicial = useMemo<Registro[]>(
    () => servidor?.registros ?? imoveis.map((pub) => ({ pub, priv: privados[pub.ref] })).filter((r) => r.priv),
    [servidor, imoveis, privados],
  );
  const [usuario, setUsuario] = useState(servidor?.usuario ?? "");
  const [lista, setLista] = useState<Registro[]>(inicial);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const [finalidade, setFinalidade] = useState("");
  const [aberto, setAberto] = useState<{ r: Registro; novo: boolean } | null>(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (servidor) return;
    try {
      const salvo = localStorage.getItem(CHAVE_LOCAL);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (salvo) setLista(JSON.parse(salvo));
      if (sessionStorage.getItem(CHAVE_LOCAL + "-login")) setUsuario(sessionStorage.getItem(CHAVE_LOCAL + "-login") || "");
    } catch {}
  }, [servidor]);

  function guardar(nova: Registro[]) {
    setLista(nova);
    if (servidor) return;
    try { localStorage.setItem(CHAVE_LOCAL, JSON.stringify(nova)); } catch {}
  }

  function entrar(email: string) {
    setUsuario(email);
    try { sessionStorage.setItem(CHAVE_LOCAL + "-login", email); } catch {}
  }
  function sair() {
    // Rota do servidor que apaga o cookie de sessão (não é uma página do Next).
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    if (servidor) { window.location.href = "/api/painel/sair/"; return; }
    setUsuario("");
    try { sessionStorage.removeItem(CHAVE_LOCAL + "-login"); } catch {}
  }

  const filtrada = useMemo(() => {
    const q = busca.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return lista.filter(({ pub, priv }) => {
      const alvo = [pub.ref, pub.titulo, pub.bairro, pub.cidade, priv.proprietario, priv.endereco, priv.telefone].join(" ").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      return (!q || alvo.includes(q)) && (!status || priv.status === status) && (!finalidade || pub.finalidade === finalidade);
    });
  }, [lista, busca, status, finalidade]);

  const resumo = useMemo(() => ({
    total: lista.length,
    disponiveis: lista.filter((r) => r.priv.status === "Disponível").length,
    reservados: lista.filter((r) => r.priv.status === "Reservado").length,
    fechados: lista.filter((r) => r.priv.status === "Vendido" || r.priv.status === "Alugado").length,
    vencendo: lista.filter((r) => r.priv.exclusividade && diasAte(r.priv.exclusividadeAte) >= 0 && diasAte(r.priv.exclusividadeAte) <= 30).length,
  }), [lista]);

  function novoImovel() {
    const maior = Math.max(...lista.map((r) => Number(r.pub.ref.replace(/\D/g, "")) || 0), 200);
    const ref = `GG-${String(maior + 1).padStart(4, "0")}`;
    setAberto({
      novo: true,
      r: {
        pub: { slug: `novo-${ref.toLowerCase()}`, ref, titulo: "", tipo: "Apartamento", finalidade: "venda", cidade: "Santos", bairro: "", preco: 0, area: 0, dormitorios: 0, suites: 0, banheiros: 0, vagas: 0, distanciaPraia: 0, vistaMar: false, destaque: true, resumo: "", descricao: [], caracteristicas: [], lazer: [], imagens: [] },
        priv: { status: "Disponível", endereco: "", complemento: "", cep: "", proprietario: "", telefone: "", email: "", chaves: "Com o corretor", chavesObs: "", comissao: "6%", exclusividade: false, exclusividadeAte: "", captadoEm: new Date().toISOString().slice(0, 10), observacoes: "" },
      },
    });
  }

  function avisar(t: string) {
    setAviso(t);
    setTimeout(() => setAviso(""), 3500);
  }

  async function salvar(r: Registro): Promise<string | null> {
    let salvo = r;
    if (servidor) {
      try {
        const resp = await fetch("/api/painel/imoveis/", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) });
        const json = (await resp.json()) as { registro?: Registro; erro?: string };
        if (resp.status === 401) return "Sua sessão expirou. Recarregue a página e digite a senha de novo.";
        if (!resp.ok || !json.registro) return json.erro ?? "Não foi possível salvar.";
        salvo = json.registro;
      } catch {
        return "Não foi possível salvar. Verifique a internet e tente de novo.";
      }
    }
    const existe = lista.some((x) => x.pub.ref === salvo.pub.ref);
    guardar(existe ? lista.map((x) => (x.pub.ref === salvo.pub.ref ? salvo : x)) : [salvo, ...lista]);
    setAberto(null);
    avisar(existe ? `Ref ${salvo.pub.ref} atualizado.` : `Ref ${salvo.pub.ref} cadastrado.`);
    return null;
  }

  async function excluir(r: Registro): Promise<string | null> {
    if (servidor) {
      try {
        const resp = await fetch(`/api/painel/imoveis/?ref=${encodeURIComponent(r.pub.ref)}`, { method: "DELETE" });
        if (!resp.ok) return "Não foi possível excluir.";
      } catch {
        return "Não foi possível excluir. Verifique a internet e tente de novo.";
      }
    }
    guardar(lista.filter((x) => x.pub.ref !== r.pub.ref));
    setAberto(null);
    avisar(`Ref ${r.pub.ref} excluído.`);
    return null;
  }

  if (!usuario) return <Login aoEntrar={entrar} />;

  const sel = "rounded-sm border border-linha bg-papel px-3 py-2.5 text-sm outline-none focus:border-mar";

  return (
    <div className="min-h-screen bg-nevoa">
      <div className="bg-tinta text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-8">
          <img src={foto("/marca/logo-clara.png")} data-marca="logo-clara" alt="GG Imóveis Litoral" className="h-10 w-auto" />
          <span className="hidden border-l border-white/20 pl-4 text-sm font-medium sm:inline">Painel do corretor</span>
          <span className="hidden text-xs text-white/60 md:ml-auto md:inline">{usuario}</span>
          <a href={siteHash ? `${baseSite}#inicio` : `${baseSite}/`} target="_blank" rel="noopener" className="ml-auto rounded-full border border-white/25 px-4 py-2 text-xs font-medium hover:border-white md:ml-0">Ver site</a>
          <button type="button" onClick={sair} className="text-xs text-white/70 underline hover:text-white">Sair</button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl">Imóveis</h1>
            <p className="mt-1 text-sm text-cinza">Dados privados ficam só aqui. O site mostra apenas os campos públicos.</p>
          </div>
          <button type="button" onClick={novoImovel} className="rounded-full bg-latao px-6 py-3 text-sm font-semibold text-tinta hover:brightness-105">+ Cadastrar imóvel</button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Tile rotulo="Imóveis cadastrados" valor={resumo.total} />
          <Tile rotulo="Disponíveis" valor={resumo.disponiveis} />
          <Tile rotulo="Reservados" valor={resumo.reservados} />
          <Tile rotulo="Vendidos ou alugados" valor={resumo.fechados} />
          <div className="col-span-2 md:col-span-1"><Tile rotulo="Exclusividades vencendo (30 dias)" valor={resumo.vencendo} destaque /></div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-linha bg-papel p-3 md:flex-row">
          <label htmlFor="p-busca" className="flex flex-1 items-center gap-2 rounded-sm border border-linha px-3 focus-within:border-mar">
            <IconeLupa className="text-cinza" />
            <input id="p-busca" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar ref, bairro, proprietário, endereço…" className="w-full bg-transparent py-2.5 text-sm outline-none" />
          </label>
          <div className="grid grid-cols-2 gap-3 md:flex">
            <select aria-label="Filtrar por status" className={sel} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {STATUS.map((s) => (<option key={s}>{s}</option>))}
            </select>
            <select aria-label="Filtrar por finalidade" className={sel} value={finalidade} onChange={(e) => setFinalidade(e.target.value)}>
              <option value="">Venda e aluguel</option>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </select>
          </div>
        </div>

        <p className="mt-5 text-sm text-cinza"><strong className="text-tinta">{filtrada.length}</strong> {filtrada.length === 1 ? "imóvel" : "imóveis"}</p>

        {/* Tabela (computador) */}
        <div className="mt-3 hidden overflow-x-auto rounded-lg border border-linha bg-papel lg:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-linha bg-nevoa/60 text-xs uppercase tracking-wide text-cinza">
              <tr>
                <th className="px-4 py-3 font-semibold">Imóvel</th>
                <th className="px-4 py-3 font-semibold">Endereço</th>
                <th className="px-4 py-3 font-semibold">Proprietário</th>
                <th className="px-4 py-3 font-semibold">Valor</th>
                <th className="px-4 py-3 font-semibold">Exclusividade</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtrada.map((r) => (
                <tr key={r.pub.ref} className="cursor-pointer border-b border-linha last:border-0 hover:bg-nevoa/50" onClick={() => setAberto({ r, novo: false })}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={foto(r.pub.imagens[0] ?? "")} alt="" className="h-12 w-16 shrink-0 rounded-sm bg-nevoa object-cover" />
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-cinza">{r.pub.ref}</p>
                        <p className="max-w-[16rem] truncate font-medium">{r.pub.titulo}</p>
                        <p className="text-xs text-cinza">{r.pub.bairro} · {r.pub.cidade}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><p>{r.priv.endereco}</p><p className="text-xs text-cinza">{r.priv.complemento}</p></td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.priv.proprietario}</p>
                    <a href={whatsDe(r.priv.telefone)} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs text-whats hover:underline"><IconeWhatsApp width={13} height={13} /> {r.priv.telefone}</a>
                  </td>
                  <td className="px-4 py-3 tabular-nums"><p className="font-medium">{precoImovel(r.pub)}</p><p className="text-xs text-cinza">Comissão {r.priv.comissao}</p></td>
                  <td className="px-4 py-3 text-xs"><Exclusividade p={r.priv} /></td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${COR_STATUS[r.priv.status]}`}>{r.priv.status}</span></td>
                  <td className="px-4 py-3 text-cinza"><IconeChevron /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cartões (celular e tablet) */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:hidden">
          {filtrada.map((r) => (
            <button key={r.pub.ref} type="button" onClick={() => setAberto({ r, novo: false })} className="flex w-full min-w-0 gap-3 rounded-lg border border-linha bg-papel p-3 text-left">
              <img src={foto(r.pub.imagens[0] ?? "")} alt="" className="h-20 w-20 shrink-0 rounded-sm bg-nevoa object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-cinza">{r.pub.ref}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${COR_STATUS[r.priv.status]}`}>{r.priv.status}</span>
                </div>
                <p className="truncate text-sm font-medium">{r.pub.titulo}</p>
                <p className="truncate text-xs text-cinza">{r.priv.endereco}{r.priv.complemento ? ` · ${r.priv.complemento}` : ""}</p>
                <p className="mt-1 truncate text-xs"><strong>{r.priv.proprietario}</strong> · {r.priv.telefone}</p>
                <p className="mt-1 text-xs"><span className="font-semibold tabular-nums">{precoImovel(r.pub)}</span> · <Exclusividade p={r.priv} /></p>
              </div>
            </button>
          ))}
        </div>

        {filtrada.length === 0 && (<p className="mt-6 rounded-lg border border-dashed border-linha p-10 text-center text-cinza">Nenhum imóvel encontrado com esses filtros.</p>)}

        {servidor && (
          <p className="mt-10 text-xs text-cinza">
            Fotos enviadas: {mb(servidor.bytesFotos)} MB de {mb(LIMITE_FOTOS)} MB disponíveis no plano gratuito. Cada novo login no painel gera um aviso no seu e-mail.
          </p>
        )}
        {!servidor && <p className="mt-10 rounded-lg bg-latao/15 p-4 text-xs leading-relaxed text-tinta/80">
          <strong>Protótipo com dados fictícios.</strong> As alterações ficam salvas apenas neste navegador. Na versão final, os dados ficam no banco da sua conta Cloudflare e o acesso é protegido por login.
        </p>}
      </main>

      {aberto && <Ficha inicial={aberto.r} novo={aberto.novo} baseSite={baseSite} siteHash={siteHash} servidor={!!servidor} aoSalvar={salvar} aoExcluir={excluir} aoFechar={() => setAberto(null)} />}
      {aviso && (<div role="status" className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-tinta px-5 py-3 text-sm font-medium text-white shadow-lg">{aviso}</div>)}
    </div>
  );
}
