// Assistente virtual do site. Roda no navegador, sem servidor e sem custo.
// Entende pedidos de imóvel em linguagem natural (tipo, cidade, bairro, quartos, valor, vista mar),
// mostra os imóveis encontrados, lembra o que já foi pedido e responde dúvidas frequentes.
// Este arquivo não importa nada: a prévia em arquivo único reaproveita o mesmo código.

export type LinkChat = { rotulo: string; href: string; externo?: boolean };
export type ImovelChat = {
  slug: string; ref: string; titulo: string; tipo: string; finalidade: "venda" | "aluguel";
  cidade: string; cidadeSlug: string; bairro: string; preco: number; precoTexto: string;
  dorm: number; suites: number; vagas: number; area: number; vistaMar: boolean; praia: number; imagem: string; destaque: boolean;
  extras: string; // características e lazer, normalizados, para buscas como "com piscina"
};
export type Resposta = { texto: string; links?: LinkChat[]; sugestoes?: string[]; imoveis?: ImovelChat[] };
export type Intencao = Resposta & { id: string; chaves: string[] };
export type CidadeChat = { nome: string; slug: string; chaves: string[]; texto: string };
export type DadosChat = {
  intencoes: Intencao[]; cidades: CidadeChat[]; bairros: { nome: string; cidadeSlug: string }[];
  imoveis: ImovelChat[]; boasVindas: Resposta; naoEntendi: Resposta; whatsapp: string;
};
export type Filtros = {
  finalidade?: "venda" | "aluguel"; cidade?: string; bairro?: string; tipo?: string;
  dorm?: number; suites?: number; vagas?: number; preco?: number; vista?: boolean; praia?: number; extras?: string[];
};
export type Contexto = { filtros: Filtros };

export const normalizar = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9$.,/ ]/g, " ").replace(/\s+/g, " ").trim();
const limpar = (t: string) => t.replace(/[$.,/]/g, " ").replace(/\s+/g, " ").trim();

// Distância de edição: tolera um erro de digitação ("finaciamento", "itanhem").
function distancia(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

// Peso de uma chave no texto: 2 = exata (começo de palavra ou trecho com espaço), 1 = parecida (um erro de digitação), 0 = ausente.
// Chaves de uma palavra valem como começo de palavra ("alug" → alugar, aluguel).
function peso(texto: string, palavras: string[], chave: string) {
  if (chave.includes(" ")) return ` ${texto} `.includes(` ${chave} `) ? 2 : 0;
  if (palavras.some((p) => p.startsWith(chave))) return 2;
  if (chave.length < 6) return 0;
  const n = chave.length;
  return palavras.some((p) => p.length >= n - 1 && [n - 1, n, n + 1].some((m) => distancia(p.slice(0, m), chave) <= 1)) ? 1 : 0;
}
const contem = (texto: string, palavras: string[], chave: string) => peso(texto, palavras, chave) > 0;

const NUMEROS: Record<string, number> = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6 };
const num = (t: string) => NUMEROS[t] ?? Number(t);

const TIPOS: [string, string[]][] = [
  ["Sala comercial", ["sala comercial", "salas comerciais", "sala", "loja", "comercial", "escritorio", "consultorio", "ponto comercial"]],
  ["Cobertura", ["cobertura", "coberturas", "duplex"]],
  ["Studio", ["studio", "studios", "kitnet", "kit", "loft", "flat", "quitinete"]],
  ["Casa", ["casa", "casas", "sobrado", "sobrados", "casa terrea"]],
  ["Apartamento", ["apartamento", "apartamentos", "apto", "aptos", "ape", "apes", "ap"]],
];

// Valores: "500 mil", "1,5 milhão", "500k", "R$ 3.000", "750000".
function lerValor(t: string): number | undefined {
  const m = t.match(/(\d+(?:[.,]\d+)?)\s*(milhoes|milhao|mi|mm|mil|k)\b/);
  if (m) {
    const n = Number(m[1].replace(",", "."));
    return Math.round(n * (/^m(ilh|i$|m)/.test(m[2]) ? 1_000_000 : 1_000));
  }
  const r = t.match(/(?:r\$\s*|ate\s+|maximo\s+|menos de\s+)(\d{1,3}(?:\.\d{3})+|\d{3,})(?:,\d+)?/);
  if (r) return Number(r[1].replace(/\./g, ""));
  const solto = t.match(/\b(\d{1,3}(?:\.\d{3})+|\d{4,})\b/);
  return solto ? Number(solto[1].replace(/\./g, "")) : undefined;
}

export function lerFiltros(d: DadosChat, entrada: string): Filtros {
  const t = normalizar(entrada);
  const s = limpar(t);
  const palavras = s.split(" ");
  const f: Filtros = {};

  if (contem(s, palavras, "alug") || contem(s, palavras, "locac") || contem(s, palavras, "inquilin") || / por mes|\/mes|mensal/.test(t)) f.finalidade = "aluguel";
  else if (contem(s, palavras, "compr") || / a venda | venda | adquirir /.test(` ${s} `)) f.finalidade = "venda";

  for (const [tipo, chaves] of TIPOS) if (chaves.some((k) => (k.includes(" ") ? ` ${s} `.includes(` ${k} `) : palavras.includes(k)))) { f.tipo = tipo; break; }

  const q = s.match(/\b(\d+|um|uma|dois|duas|tres|quatro|cinco|seis)\s*(quartos?|dormitorios?|dorms?|qts?|suites?)\b/);
  if (q) { if (q[2].startsWith("suite")) f.suites = num(q[1]); else f.dorm = num(q[1]); }
  const v = s.match(/\b(\d+|uma|duas|tres)\s*vagas?\b/);
  if (v) f.vagas = num(v[1]);

  const semQuartos = t.replace(/\b\d+\s*(quartos?|dormitorios?|dorms?|qts?|suites?|vagas?|m2|metros?)\b/g, " ");
  const valor = lerValor(semQuartos);
  if (valor && valor >= 300) {
    f.preco = valor;
    if (!f.finalidade) f.finalidade = valor < 30000 ? "aluguel" : "venda";
  }

  const EXTRAS: [string, string][] = [["piscina", "piscina"], ["churrasqueira", "churrasqueira"], ["mobiliad", "mobiliado"], ["academia", "academia"], ["varanda", "varanda"], ["sacada", "sacada"], ["gourmet", "gourmet"], ["portaria", "portaria"], ["financiamento", "financiamento"]];
  const extras = EXTRAS.filter(([k]) => palavras.some((p) => p.startsWith(k))).map(([, v]) => v);
  if (extras.length) f.extras = extras;

  if (/vista (para o |pro )?mar|frente (para o |pro )?mar|frente mar|pe na areia|beira mar/.test(s)) f.vista = true;
  else if (/(perto|proximo|pertinho) (da|de|a) praia|perto do mar|perto da orla/.test(s)) f.praia = 300;

  // Cidade: aceita um erro de digitação ("itanhem", "guaruj") em nomes de 6 letras ou mais.
  const janela = (n: number) => palavras.map((_, i) => palavras.slice(i, i + n).join(" "));
  for (const c of d.cidades) {
    const achou = c.chaves.some((k) => {
      const opcoes = janela(k.split(" ").length);
      return opcoes.some((o) => o === k || (k.length >= 6 && distancia(o, k) <= 1));
    });
    if (achou) { f.cidade = c.slug; break; }
  }
  // Bairro: só aceita "Centro" e outros nomes repetidos quando a cidade já é conhecida.
  const candidatos = d.bairros.filter((b) => ` ${s} `.includes(` ${normalizar(b.nome)} `));
  const doBairro = candidatos.filter((b) => !f.cidade || b.cidadeSlug === f.cidade);
  if (doBairro.length) {
    const unico = new Set(doBairro.map((b) => b.cidadeSlug)).size === 1;
    if (unico || f.cidade) { f.bairro = doBairro[0].nome; f.cidade = f.cidade ?? doBairro[0].cidadeSlug; }
    else if (normalizar(doBairro[0].nome) !== "centro") f.bairro = doBairro[0].nome;
  }
  return f;
}

const temFiltro = (f: Filtros) => Object.values(f).some((v) => v !== undefined);
const fmt = (n: number) => n.toLocaleString("pt-BR");

function descrever(d: DadosChat, f: Filtros) {
  const tipo = f.tipo ? f.tipo.toLowerCase() : "imóvel";
  let inicio = f.finalidade === "aluguel" ? `${tipo} para alugar` : f.finalidade === "venda" ? `${tipo} para comprar` : tipo;
  if (f.bairro) inicio += ` no ${f.bairro}`;
  const cidade = d.cidades.find((c) => c.slug === f.cidade)?.nome;
  if (cidade) inicio += ` em ${cidade}`;
  const partes: string[] = [inicio];
  if (f.dorm) partes.push(`com ${f.dorm}+ ${f.dorm === 1 ? "quarto" : "quartos"}`);
  if (f.suites) partes.push(`com ${f.suites}+ ${f.suites === 1 ? "suíte" : "suítes"}`);
  if (f.vagas) partes.push(`${f.vagas}+ ${f.vagas === 1 ? "vaga" : "vagas"}`);
  if (f.preco) partes.push(`até R$ ${fmt(f.preco)}${f.finalidade === "aluguel" ? "/mês" : ""}`);
  if (f.vista) partes.push("com vista para o mar");
  if (f.praia) partes.push("perto da praia");
  if (f.extras) partes.push(`com ${f.extras.join(" e ")}`);
  return partes.join(", ");
}

function filtrar(lista: ImovelChat[], f: Filtros) {
  return lista.filter((i) =>
    (!f.finalidade || i.finalidade === f.finalidade) && (!f.cidade || i.cidadeSlug === f.cidade) &&
    (!f.bairro || normalizar(i.bairro) === normalizar(f.bairro)) && (!f.tipo || i.tipo === f.tipo) &&
    (!f.dorm || i.dorm >= f.dorm) && (!f.suites || i.suites >= f.suites) && (!f.vagas || i.vagas >= f.vagas) &&
    (!f.preco || i.preco <= f.preco) && (!f.vista || i.vistaMar) && (!f.praia || i.praia <= f.praia) &&
    (!f.extras || f.extras.every((e) => i.extras.includes(e))));
}

function linkCatalogo(f: Filtros) {
  const q = new URLSearchParams();
  if (f.finalidade) q.set("finalidade", f.finalidade);
  if (f.cidade) q.set("cidade", f.cidade);
  if (f.tipo) q.set("tipo", f.tipo);
  if (f.dorm) q.set("dorm", String(f.dorm));
  if (f.preco) q.set("preco", String(f.preco));
  if (f.vista) q.set("vista", "1");
  return `/imoveis/${q.size ? `?${q}` : ""}`;
}

function buscar(d: DadosChat, f: Filtros): Resposta {
  const ordenar = (l: ImovelChat[]) => [...l].sort((a, b) => Number(b.destaque) - Number(a.destaque) || a.preco - b.preco);
  let achados = ordenar(filtrar(d.imoveis, f));
  const pedido = descrever(d, f);
  const msgGustavo = `Olá, Gustavo! Vim pelo assistente do site. Procuro: ${pedido}.`;
  const whats = { rotulo: "Pedir ao Gustavo", href: `${d.whatsapp.split("?")[0]}?text=${encodeURIComponent(msgGustavo)}`, externo: true };
  const refinos = [
    !f.finalidade ? "Para alugar" : "",
    !f.vista ? "Com vista para o mar" : "",
    !f.dorm && f.tipo !== "Sala comercial" ? "Com 3 quartos" : "",
    !f.cidade ? "Em Santos" : "",
    "Nova busca",
  ].filter(Boolean).slice(0, 3);

  if (achados.length) {
    const n = achados.length;
    return {
      texto: `Entendi: ${pedido}. ${n === 1 ? "Encontrei 1 opção" : `Encontrei ${n} opções`}${n > 3 ? ". Estas são as primeiras:" : ":"}`,
      imoveis: achados.slice(0, 3),
      links: [...(n > 3 ? [{ rotulo: `Ver as ${n} opções`, href: linkCatalogo(f) }] : []), whats],
      sugestoes: refinos,
    };
  }
  // Nada exato: afrouxa um critério de cada vez para sugerir algo próximo.
  const ordemAfrouxar: (keyof Filtros)[] = ["extras", "preco", "vista", "praia", "vagas", "suites", "dorm", "bairro", "tipo", "cidade"];
  const nomes: Partial<Record<keyof Filtros, string>> = { extras: "essa característica", preco: "o limite de valor", vista: "a vista para o mar", praia: "a distância da praia", vagas: "o número de vagas", suites: "o número de suítes", dorm: "o número de quartos", bairro: "o bairro", tipo: "o tipo de imóvel", cidade: "a cidade" };
  for (const k of ordemAfrouxar) {
    if (f[k] === undefined) continue;
    const g = { ...f, [k]: undefined };
    achados = ordenar(filtrar(d.imoveis, g));
    if (achados.length)
      return {
        texto: `Não encontrei ${pedido} anunciado no momento. Sem ${nomes[k]}, há ${achados.length === 1 ? "esta opção" : "estas opções"}:`,
        imoveis: achados.slice(0, 3),
        links: [whats],
        sugestoes: ["Nova busca", "Falar com o Gustavo"],
      };
  }
  return {
    texto: `Não encontrei ${pedido} anunciado no site agora. O Gustavo recebe imóveis novos com frequência e pode procurar um para você.`,
    links: [whats],
    sugestoes: ["Nova busca"],
  };
}

const ESPECIALISTAS = ["fora", "anunciar", "avaliacao", "drone", "financiamento", "documentos", "custos", "visita", "horario", "creci", "contato", "agradecimento", "condominio", "fiador", "permuta", "exclusividade", "prazo"];

export function responder(d: DadosChat, entrada: string, ctx: Contexto = { filtros: {} }): { resposta: Resposta; contexto: Contexto } {
  const t = limpar(normalizar(entrada));
  const palavras = t.split(" ");

  if (/^(nova busca|recomecar|limpar|outra busca|comecar de novo)$/.test(t))
    return { resposta: { texto: "Certo, vamos começar de novo. O que você procura? Por exemplo: “apartamento de 2 quartos em Santos até 600 mil”.", sugestoes: d.boasVindas.sugestoes }, contexto: { filtros: {} } };

  let melhor: Intencao | undefined;
  let pontos = 0;
  for (const i of d.intencoes) {
    const p = i.chaves.reduce((soma, k) => soma + peso(t, palavras, k), 0);
    if (p > pontos) { pontos = p; melhor = i; }
  }
  const novos = lerFiltros(d, entrada);

  // Dúvidas específicas (anunciar, financiamento, drone...) têm prioridade sobre a busca.
  // (Exceto contato e agradecimento: "Gustavo, quero um apê em Santos" é um pedido de imóvel.)
  const suave = ["contato", "agradecimento", "creci", "horario"].includes(melhor?.id ?? "");
  if (melhor && ESPECIALISTAS.includes(melhor.id) && !(suave && temFiltro(novos))) return { resposta: melhor, contexto: ctx };

  // Pedido de imóvel: junta com o que já foi pedido antes na conversa.
  if (temFiltro(novos) || melhor?.id === "comprar" || melhor?.id === "alugar") {
    const filtros: Filtros = { ...ctx.filtros, ...novos };
    if (melhor?.id === "alugar") filtros.finalidade = "aluguel";
    if (melhor?.id === "comprar") filtros.finalidade = "venda";
    if (novos.finalidade && novos.finalidade !== ctx.filtros.finalidade && !novos.preco) delete filtros.preco; // faixa de venda não vale para aluguel
    if (novos.cidade && novos.cidade !== ctx.filtros.cidade && !novos.bairro) delete filtros.bairro;
    return { resposta: buscar(d, filtros), contexto: { filtros } };
  }

  if (melhor?.id === "cidades") return { resposta: melhor, contexto: ctx };
  if (melhor) return { resposta: melhor, contexto: ctx };
  return { resposta: d.naoEntendi, contexto: ctx };
}
