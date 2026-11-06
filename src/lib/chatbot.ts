// Assistente virtual do site: respostas prontas por palavras-chave (sem servidor e sem custo).
// A lógica fica separada dos dados para poder ser reaproveitada na prévia.

export type LinkChat = { rotulo: string; href: string; externo?: boolean };
export type Resposta = { texto: string; links?: LinkChat[]; sugestoes?: string[] };
export type Intencao = Resposta & { id: string; chaves: string[] };
export type CidadeChat = { nome: string; slug: string; venda: number; aluguel: number; chaves: string[] };
export type DadosChat = { intencoes: Intencao[]; cidades: CidadeChat[]; boasVindas: Resposta; naoEntendi: Resposta; whatsapp: string };

export const normalizar = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

// Uma chave de uma palavra vale como prefixo ("alug" casa com "alugar" e "aluguel"); chaves com espaço valem como trecho.
function contem(texto: string, palavras: string[], chave: string) {
  return chave.includes(" ") ? ` ${texto} `.includes(` ${chave} `) : palavras.some((p) => p.startsWith(chave));
}

export function responder(d: DadosChat, entrada: string): Resposta {
  const texto = normalizar(entrada);
  const palavras = texto.split(" ");
  let melhor: Intencao | undefined;
  let pontos = 0;
  for (const i of d.intencoes) {
    const p = i.chaves.filter((k) => contem(texto, palavras, k)).length;
    if (p > pontos) { pontos = p; melhor = i; }
  }
  const cidade = d.cidades.find((c) => c.chaves.some((k) => contem(texto, palavras, k)));
  if (cidade && (!melhor || ["comprar", "alugar", "cidades", "saudacao"].includes(melhor.id))) {
    const fin = melhor?.id === "alugar" ? "aluguel" : melhor?.id === "comprar" ? "venda" : "";
    const qtd = fin === "aluguel" ? cidade.aluguel : fin === "venda" ? cidade.venda : cidade.venda + cidade.aluguel;
    const oque = fin === "aluguel" ? "para alugar" : fin === "venda" ? "à venda" : "disponíveis";
    const q = `?cidade=${cidade.slug}${fin ? `&finalidade=${fin}` : ""}`;
    return {
      texto: qtd
        ? `Há ${qtd} ${qtd === 1 ? "imóvel" : "imóveis"} ${oque} em ${cidade.nome} no momento.`
        : `No momento não há imóveis ${oque} em ${cidade.nome} anunciados no site, mas o Gustavo pode procurar um para você.`,
      links: [
        ...(qtd ? [{ rotulo: `Ver imóveis em ${cidade.nome}`, href: `/imoveis/${q}` }] : []),
        { rotulo: "Falar com o Gustavo", href: d.whatsapp, externo: true },
      ],
      sugestoes: ["Como funciona o financiamento?", "Quero agendar uma visita"],
    };
  }
  return melhor ?? d.naoEntendi;
}
