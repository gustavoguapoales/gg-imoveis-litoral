import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ambiente, listarTodos } from "@/lib/banco";
import { verificarAcesso } from "@/lib/acesso";
import { SITE } from "@/lib/site";
import { agrupar, Barras, COR_ORIGEM, type Fatia, Numero, Pizza } from "@/components/painel/Graficos";
import { GeradorQR } from "@/components/painel/GeradorQR";

// Painel de visitas e leads: de onde vêm, de que cidade, por qual aparelho e o que olham.
export const metadata: Metadata = { title: "Visitas do site", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const PERIODOS = [7, 30, 90, 365];
const FIXAS = Object.keys(COR_ORIGEM);
const fmt = (n: number) => n.toLocaleString("pt-BR");
const hora = (utc: string) => new Date(utc.replace(" ", "T") + "Z").toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default async function PaginaVisitas({ searchParams }: PageProps<"/painel/visitas">) {
  if (!(await verificarAcesso(await headers()))) redirect("/painel/");
  const pedido = Number((await searchParams).dias);
  const dias = PERIODOS.includes(pedido) ? pedido : 30;
  const desde = `-${dias} days`;
  const { DB } = await ambiente();
  const W = "em >= datetime('now', ?)";
  const q = (sql: string, ...v: unknown[]) => DB.prepare(sql).bind(...v);

  const [resumo, agora, origens, cidades, aparelhos, porDia, porHora, paginas, detalhes, leads, leadsOrigem, ultimas, hoje] = await DB.batch([
    q(`SELECT count(*) AS paginas, count(DISTINCT sessao) AS visitas, count(DISTINCT visitante) AS visitantes, count(DISTINCT CASE WHEN novo = 1 THEN visitante END) AS novos FROM visitas WHERE ${W}`, desde),
    q("SELECT count(DISTINCT sessao) AS n FROM visitas WHERE em >= datetime('now', '-5 minutes')"),
    q(`SELECT origem AS k, count(DISTINCT sessao) AS n FROM visitas WHERE ${W} GROUP BY origem ORDER BY n DESC`, desde),
    q(`SELECT COALESCE(cidade, 'Não identificada') || CASE WHEN pais IS NOT NULL AND pais <> 'BR' THEN ' (' || pais || ')' ELSE '' END AS k, count(DISTINCT sessao) AS n FROM visitas WHERE ${W} GROUP BY k ORDER BY n DESC`, desde),
    q(`SELECT dispositivo AS k, count(DISTINCT sessao) AS n FROM visitas WHERE ${W} GROUP BY k ORDER BY n DESC`, desde),
    q(`SELECT date(em, '-3 hours') AS k, count(DISTINCT sessao) AS n FROM visitas WHERE ${W} GROUP BY k`, desde),
    q(`SELECT strftime('%H', em, '-3 hours') AS k, count(DISTINCT sessao) AS n FROM visitas WHERE ${W} GROUP BY k`, desde),
    q(`SELECT pagina AS k, count(*) AS n FROM visitas WHERE ${W} GROUP BY pagina ORDER BY n DESC LIMIT 40`, desde),
    q(`SELECT origem, detalhe, count(DISTINCT sessao) AS n FROM visitas WHERE ${W} AND detalhe IS NOT NULL GROUP BY origem, detalhe ORDER BY n DESC LIMIT 15`, desde),
    q(`SELECT count(*) AS n FROM clientes WHERE ${W}`, desde),
    q(`SELECT COALESCE(v.origem, 'Sem registro') AS k, count(*) AS n FROM clientes c LEFT JOIN (SELECT sessao, min(origem) AS origem FROM visitas WHERE ${W} GROUP BY sessao) v ON v.sessao = c.sessao WHERE c.${W} GROUP BY k ORDER BY n DESC`, desde, desde),
    q(`SELECT v.sessao, min(v.em) AS inicio, max(v.origem) AS origem, max(v.detalhe) AS detalhe, max(v.cidade) AS cidade, max(v.regiao) AS regiao, max(v.dispositivo) AS aparelho, count(*) AS paginas, max(v.novo) AS novo,
       EXISTS (SELECT 1 FROM clientes c WHERE c.sessao = v.sessao) AS virou_lead
       FROM visitas v WHERE v.em >= datetime('now', '-3 days') GROUP BY v.sessao ORDER BY inicio DESC LIMIT 30`),
    q("SELECT date('now', '-3 hours') AS d"),
  ]);
  const linhas = <T,>(r: D1Result) => r.results as T[];
  const R = linhas<{ paginas: number; visitas: number; visitantes: number; novos: number }>(resumo)[0];
  const totalLeads = linhas<{ n: number }>(leads)[0]?.n ?? 0;

  // Preenche dias e horas sem visita com zero.
  const mapaDia = new Map(linhas<Fatia>(porDia).map((d) => [d.k, d.n]));
  const hojeSP = new Date(`${linhas<{ d: string }>(hoje)[0].d}T12:00:00Z`);
  const nDias = Math.min(dias, 90);
  const serieDias: Fatia[] = Array.from({ length: nDias }, (_, i) => {
    const d = new Date(hojeSP.getTime() - (nDias - 1 - i) * 86400_000).toISOString().slice(0, 10);
    return { k: d.slice(8, 10) + "/" + d.slice(5, 7), n: mapaDia.get(d) ?? 0 };
  });
  const mapaHora = new Map(linhas<Fatia>(porHora).map((d) => [d.k, d.n]));
  const serieHoras: Fatia[] = Array.from({ length: 24 }, (_, h) => ({ k: `${h}h`, n: mapaHora.get(String(h).padStart(2, "0")) ?? 0 }));

  // Imóveis mais vistos: liga o endereço da página ao imóvel.
  const registros = await listarTodos();
  const porSlug = new Map(registros.map((r) => [r.pub.slug, r.pub]));
  const todasPaginas = linhas<Fatia>(paginas);
  const imoveis = todasPaginas.flatMap((p) => {
    const slug = p.k.match(/^\/imoveis\/([^/]+)/)?.[1];
    const im = slug ? porSlug.get(slug) : undefined;
    return im ? [{ ...p, titulo: im.titulo, ref: im.ref, local: `${im.bairro}, ${im.cidade}` }] : [];
  }).slice(0, 8);
  const NOMES: Record<string, string> = { "/": "Página inicial", "/imoveis/": "Busca de imóveis", "/contato/": "Contato", "/anunciar/": "Anunciar imóvel", "/avaliacao/": "Avaliação", "/drone/": "Drone" };
  const nomePagina = (p: string) => NOMES[p] ?? (porSlug.get(p.match(/^\/imoveis\/([^/]+)/)?.[1] ?? "")?.titulo || p);

  const taxa = R.visitas ? ((totalLeads / R.visitas) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : "0";
  const agoraN = linhas<{ n: number }>(agora)[0]?.n ?? 0;

  return (
    <div className="min-h-screen bg-nevoa">
      <div className="bg-tinta text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marca/logo-clara.png" alt="GG Imóveis Litoral" className="h-10 w-auto" />
          <span className="hidden border-l border-white/20 pl-4 text-sm font-medium sm:inline">Painel do corretor</span>
          <Link href="/painel/" className="ml-auto rounded-full border border-white/25 px-4 py-2 text-xs font-medium hover:border-white">← Imóveis</Link>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl">Visitas e leads</h1>
            <p className="mt-1 text-sm text-cinza">
              Anônimo: não guardamos nome nem IP de quem só visita.{" "}
              <span className="inline-flex items-center gap-1.5 font-medium text-tinta"><span className={`h-2 w-2 rounded-full ${agoraN ? "bg-emerald-500" : "bg-cinza/40"}`} />{agoraN} {agoraN === 1 ? "pessoa" : "pessoas"} no site agora</span>
            </p>
          </div>
          <nav className="flex gap-1 rounded-full border border-linha bg-papel p-1 text-sm" aria-label="Período">
            {PERIODOS.map((p) => (
              <Link key={p} href={`/painel/visitas/?dias=${p}`} className={`rounded-full px-4 py-1.5 ${p === dias ? "bg-tinta text-white" : "hover:bg-nevoa"}`}>{p === 365 ? "1 ano" : `${p} dias`}</Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Numero rotulo="Visitas" valor={fmt(R.visitas)} />
          <Numero rotulo="Pessoas diferentes" valor={fmt(R.visitantes)} sub={`${fmt(R.novos)} vieram pela 1ª vez`} />
          <Numero rotulo="Páginas vistas" valor={fmt(R.paginas)} sub={R.visitas ? `${(R.paginas / R.visitas).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} por visita` : undefined} />
          <Numero rotulo="Leads (deixaram contato)" valor={fmt(totalLeads)} />
          <Numero rotulo="Conversão" valor={`${taxa}%`} sub="das visitas viraram lead" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Pizza titulo="Por onde entraram" dados={agrupar(linhas<Fatia>(origens), 6, FIXAS)} cores={COR_ORIGEM} />
          <Pizza titulo="De qual cidade" dados={agrupar(linhas<Fatia>(cidades))} />
          <Pizza titulo="Aparelho" dados={linhas<Fatia>(aparelhos)} />
          <Pizza titulo="Leads por origem" dados={agrupar(linhas<Fatia>(leadsOrigem), 6, [...FIXAS, "Sem registro"])} cores={{ ...COR_ORIGEM, "Sem registro": "#6250d6" }} vazio="Nenhum lead neste período ainda." />
          <div className="lg:col-span-2"><Barras titulo={`Visitas por dia (últimos ${nDias} dias)`} dados={serieDias} rotuloCada={nDias > 31 ? 7 : nDias > 10 ? 3 : 1} /></div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Barras titulo="Horário das visitas (horário de Brasília)" dados={serieHoras} rotuloCada={3} />
          <section className="rounded-lg border border-linha bg-papel p-5">
            <h2 className="text-sm font-semibold">Imóveis mais vistos</h2>
            {imoveis.length === 0 ? <p className="mt-4 text-sm text-cinza">Ainda sem visitas em imóveis.</p> : (
              <ol className="mt-3 divide-y divide-linha text-sm">
                {imoveis.map((m) => (
                  <li key={m.k} className="flex items-center gap-3 py-2">
                    <span className="w-16 shrink-0 font-mono text-xs text-cinza">{m.ref}</span>
                    <span className="flex-1"><span className="block truncate">{m.titulo}</span><span className="text-xs text-cinza">{m.local}</span></span>
                    <span className="tabular-nums font-medium">{fmt(m.n)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-linha bg-papel p-5">
            <h2 className="text-sm font-semibold">QR codes, campanhas e sites de origem</h2>
            {linhas<{ origem: string; detalhe: string; n: number }>(detalhes).length === 0 ? <p className="mt-4 text-sm text-cinza">Nada ainda. Crie um link ou QR code abaixo e use nas suas divulgações.</p> : (
              <table className="mt-3 w-full text-sm">
                <thead><tr className="text-left text-xs text-cinza"><th className="py-1 font-normal">Origem</th><th className="font-normal">Detalhe</th><th className="text-right font-normal">Visitas</th></tr></thead>
                <tbody className="divide-y divide-linha">
                  {linhas<{ origem: string; detalhe: string; n: number }>(detalhes).map((d) => (
                    <tr key={d.origem + d.detalhe}><td className="py-2">{d.origem}</td><td className="break-all text-cinza">{d.detalhe}</td><td className="text-right tabular-nums">{fmt(d.n)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
          <section className="rounded-lg border border-linha bg-papel p-5">
            <h2 className="text-sm font-semibold">Páginas mais vistas</h2>
            <ol className="mt-3 divide-y divide-linha text-sm">
              {todasPaginas.slice(0, 10).map((p) => (
                <li key={p.k} className="flex gap-3 py-2"><span className="flex-1 truncate" title={p.k}>{nomePagina(p.k)}</span><span className="tabular-nums">{fmt(p.n)}</span></li>
              ))}
              {todasPaginas.length === 0 && <li className="py-2 text-cinza">Ainda sem visitas.</li>}
            </ol>
          </section>
        </div>

        <section className="mt-4 rounded-lg border border-linha bg-papel p-5">
          <h2 className="text-sm font-semibold">Últimas visitas (3 dias)</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead><tr className="text-left text-xs text-cinza"><th className="py-1 font-normal">Quando</th><th className="font-normal">De onde</th><th className="font-normal">Entrou por</th><th className="font-normal">Aparelho</th><th className="text-right font-normal">Páginas</th><th className="text-right font-normal">Situação</th></tr></thead>
              <tbody className="divide-y divide-linha">
                {linhas<{ sessao: string; inicio: string; origem: string; detalhe: string | null; cidade: string | null; regiao: string | null; aparelho: string; paginas: number; novo: number; virou_lead: number }>(ultimas).map((v) => (
                  <tr key={v.sessao}>
                    <td className="py-2 tabular-nums">{hora(v.inicio)}</td>
                    <td>{v.cidade ? `${v.cidade}${v.regiao ? ` – ${v.regiao}` : ""}` : "Não identificada"}</td>
                    <td>{v.origem}{v.detalhe && v.origem === "QR code" ? <span className="text-cinza"> · {v.detalhe}</span> : null}</td>
                    <td>{v.aparelho}</td>
                    <td className="text-right tabular-nums">{v.paginas}</td>
                    <td className="text-right">{v.virou_lead ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Virou lead</span> : v.novo ? <span className="text-xs text-cinza">Nova</span> : <span className="text-xs text-cinza">Voltou</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {linhas(ultimas).length === 0 && <p className="py-3 text-sm text-cinza">Ainda sem visitas registradas.</p>}
          </div>
        </section>

        <div className="mt-4"><GeradorQR site={SITE.url} /></div>

        <p className="mt-6 text-xs text-cinza">
          Como ler: <b>Direto</b> = digitou o endereço, salvou nos favoritos ou abriu por um app que não informa a origem (o WhatsApp costuma aparecer assim).
          Para saber com certeza, use os links com etiqueta do gerador acima. A cidade é aproximada (pela internet da pessoa).
        </p>
      </main>
    </div>
  );
}
