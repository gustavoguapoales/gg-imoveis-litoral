import { cidades, type Imovel } from "@/data/imoveis";
import { linkDrone } from "./drone";
import { linkWhatsApp, precoImovel, SITE } from "./site";
import { normalizar, type DadosChat } from "./chatbot";

// Só campos PÚBLICOS dos imóveis entram no assistente.
const SUGESTOES = ["Quero comprar", "Quero alugar", "Anunciar meu imóvel", "Avaliar meu imóvel", "Filmagem com drone", "Falar com o Gustavo"];
const whats = (msg?: string) => ({ rotulo: "Falar com o Gustavo no WhatsApp", href: linkWhatsApp(msg), externo: true });

export function montarDadosChat(imoveis: Imovel[]): DadosChat {
  const nomesCidades = cidades.map((c) => c.nome).join(", ").replace(/, ([^,]*)$/, " e $1");
  const bairros = new Map<string, { nome: string; cidadeSlug: string }>();
  for (const c of cidades) for (const b of c.bairros) bairros.set(`${c.slug}:${b}`, { nome: b, cidadeSlug: c.slug });
  for (const i of imoveis) {
    const slug = cidades.find((c) => c.nome === i.cidade)!.slug;
    bairros.set(`${slug}:${i.bairro}`, { nome: i.bairro, cidadeSlug: slug });
  }

  return {
    whatsapp: linkWhatsApp("Olá, Gustavo! Vim pelo assistente do site e gostaria de atendimento."),
    imoveis: imoveis.map((i) => ({
      slug: i.slug, ref: i.ref, titulo: i.titulo, tipo: i.tipo, finalidade: i.finalidade, cidade: i.cidade,
      cidadeSlug: cidades.find((c) => c.nome === i.cidade)!.slug, bairro: i.bairro, preco: i.preco, precoTexto: precoImovel(i),
      dorm: i.dormitorios, suites: i.suites, vagas: i.vagas, area: i.area, vistaMar: i.vistaMar, praia: i.distanciaPraia,
      imagem: i.imagens[0], destaque: i.destaque,
      extras: normalizar([...i.caracteristicas, ...i.lazer, i.resumo].join(" ")),
    })),
    bairros: [...bairros.values()],
    boasVindas: {
      texto: "Olá! Sou o assistente virtual da GG Imóveis Litoral. Me diga o que você procura, do seu jeito. Por exemplo: “apartamento de 2 quartos em Santos até 600 mil” ou “casa para alugar em Mongaguá”.",
      sugestoes: SUGESTOES,
    },
    naoEntendi: {
      texto: "Não consegui entender. Você pode me dizer o tipo de imóvel, a cidade e o valor, escolher uma opção abaixo ou falar direto com o Gustavo.",
      links: [whats("Olá, Gustavo! Vim pelo site e tenho uma dúvida.")],
      sugestoes: SUGESTOES,
    },
    cidades: cidades.map((c) => ({
      nome: c.nome,
      slug: c.slug,
      texto: c.texto,
      chaves: [normalizar(c.nome), ...(c.slug === "praia-grande" ? ["pg"] : []), ...(c.slug === "sao-vicente" ? ["sv", "s vicente"] : [])],
    })),
    // A ordem desempata: as intenções mais específicas vêm primeiro.
    intencoes: [
      {
        id: "fora",
        chaves: ["sao paulo capital", "capital paulista", "na capital", "campinas", "rio de janeiro", "minas gerais", "curitiba", "interior de sao paulo", "abc paulista", "sao bernardo", "santo andre", "osasco", "guarulhos"],
        texto: `A GG Imóveis Litoral atende somente o litoral paulista: ${nomesCidades}. Se estiver pensando em morar ou investir no litoral, posso ajudar a encontrar o imóvel certo.`,
        sugestoes: cidades.slice(0, 4).map((c) => `Imóveis em ${c.nome}`),
      },
      {
        id: "visita",
        chaves: ["visit", "agend", "conhecer o imovel", "ver o imovel", "ver pessoalmente", "chamada de video"],
        texto: "As visitas são agendadas pelo WhatsApp e acompanhadas pelo Gustavo. Também é possível conhecer o imóvel por chamada de vídeo.",
        links: [whats("Olá, Gustavo! Gostaria de agendar uma visita.")],
      },
      {
        id: "drone",
        chaves: ["drone", "filmag", "filmar", "aere", "video", "obra"],
        texto: "O Gustavo faz filmagens e fotos aéreas com drone de terrenos, prédios, casas prontas e acompanhamento de obras, com opção de vídeos editados com inteligência artificial.",
        links: [{ rotulo: "Conhecer o serviço de drone", href: "/drone/" }, { rotulo: "Ver preço no WhatsApp", href: linkDrone(), externo: true }],
      },
      {
        id: "avaliacao",
        chaves: ["avali", "quanto vale", "valor do meu", "valor da minha", "precific"],
        texto: "A avaliação é gratuita e feita com base em negócios reais do bairro. Preencha os dados do imóvel e o Gustavo retorna em até 1 dia útil.",
        links: [{ rotulo: "Pedir avaliação gratuita", href: "/avaliacao/" }],
      },
      {
        id: "anunciar",
        chaves: ["anunci", "vender meu", "vender minha", "alugar meu", "alugar minha", "meu imovel", "minha casa", "meu apartamento", "proprietari", "cadastrar meu", "quero vender", "colocar a venda"],
        texto: "Ótimo! Você pode cadastrar seu imóvel para vender ou alugar. Anunciar não tem custo: o Gustavo cuida das fotos, do anúncio e do atendimento dos interessados.",
        links: [{ rotulo: "Anunciar meu imóvel", href: "/anunciar/" }],
        sugestoes: ["Quanto custa anunciar?", "Avaliar meu imóvel"],
      },
      {
        id: "custos",
        chaves: ["comiss", "taxa de corretagem", "custa anunciar", "cobra", "gratuit", "quanto custa", "corretagem"],
        texto: "Anunciar e avaliar são gratuitos. A comissão de corretagem só é cobrada quando o negócio é fechado. O Gustavo explica os detalhes pessoalmente.",
        links: [whats("Olá, Gustavo! Gostaria de saber sobre a comissão de corretagem.")],
      },
      {
        id: "financiamento",
        chaves: ["financ", "fgts", "banco", "caixa economica", "parcel", "entrada", "credito", "simulac", "minha casa minha vida"],
        texto: "O Gustavo ajuda na simulação e na aprovação do financiamento bancário, inclusive com uso do FGTS quando as regras permitem. Para simular, é só mandar mensagem com a renda aproximada e o valor do imóvel.",
        links: [whats("Olá, Gustavo! Gostaria de simular um financiamento.")],
      },
      {
        id: "fiador",
        chaves: ["fiador", "fianca", "caucao", "garantia", "seguro fianca", "titulo de capitalizacao"],
        texto: "Para alugar, as garantias mais comuns são fiador, seguro-fiança, caução (depósito) e título de capitalização. Cada proprietário aceita opções diferentes, e o Gustavo informa quais valem para o imóvel que você escolher.",
        links: [{ rotulo: "Ver imóveis para alugar", href: "/imoveis/?finalidade=aluguel" }, whats("Olá, Gustavo! Quero saber as garantias aceitas para alugar.")],
      },
      {
        id: "documentos",
        chaves: ["document", "escritur", "matricul", "certid", "itbi", "cartorio", "contrato", "registro do imovel"],
        texto: "O Gustavo cuida da análise da matrícula, das certidões e do contrato, e acompanha a escritura e o registro até a entrega das chaves.",
        links: [whats("Olá, Gustavo! Tenho uma dúvida sobre documentação.")],
      },
      {
        id: "condominio",
        chaves: ["condomin", "iptu", "despesas", "custo mensal", "gastos"],
        texto: "Em cada anúncio aparecem o valor do condomínio e do IPTU. Nos imóveis para alugar, o site também mostra o total mensal (aluguel + condomínio + IPTU).",
        links: [{ rotulo: "Ver imóveis", href: "/imoveis/" }],
      },
      {
        id: "permuta",
        chaves: ["permut", "troca", "trocar meu", "dar meu imovel", "como parte"],
        texto: "Alguns proprietários aceitam permuta, ou seja, receber outro imóvel como parte do pagamento. O Gustavo confere essa possibilidade caso a caso.",
        links: [whats("Olá, Gustavo! Tenho interesse em permuta.")],
      },
      {
        id: "exclusividade",
        chaves: ["exclusividade", "exclusivo"],
        texto: "Com exclusividade, o Gustavo é o único corretor responsável pelo imóvel. Isso permite investir mais na divulgação (fotos, drone, anúncios pagos) e organizar melhor as visitas.",
        links: [{ rotulo: "Anunciar meu imóvel", href: "/anunciar/" }],
      },
      {
        id: "prazo",
        chaves: ["quanto tempo", "demora", "prazo", "rapido"],
        texto: "O prazo depende principalmente do preço e da região. Um imóvel bem avaliado costuma vender bem mais rápido. A avaliação gratuita mostra o valor certo para o seu bairro.",
        links: [{ rotulo: "Pedir avaliação gratuita", href: "/avaliacao/" }],
      },
      {
        id: "alugar",
        chaves: ["alug", "locac", "inquilin"],
        texto: "Veja os imóveis para alugar.",
        links: [{ rotulo: "Ver imóveis para alugar", href: "/imoveis/?finalidade=aluguel" }],
      },
      {
        id: "comprar",
        chaves: ["compr", "procur", "busc", "imoveis a venda", "investir", "investimento"],
        texto: "Veja os imóveis à venda.",
        links: [{ rotulo: "Ver imóveis à venda", href: "/imoveis/?finalidade=venda" }],
      },
      {
        id: "cidades",
        chaves: ["quais cidades", "regioes", "regiao", "atendem", "atuam", "onde voces", "melhor bairro", "melhor cidade"],
        texto: `A GG Imóveis Litoral atende ${nomesCidades}. Santos tem a maior infraestrutura, Praia Grande tem prédios novos com lazer completo, o Guarujá é o destino de alto padrão, e Mongaguá e Itanhaém têm casas amplas e preços acessíveis. Qual combina mais com você?`,
        links: [{ rotulo: "Ver as regiões", href: "/#regioes" }],
        sugestoes: cidades.map((c) => `Imóveis em ${c.nome}`),
      },
      {
        id: "horario",
        chaves: ["horari", "aberto", "abre", "fecha", "funcionamento", "sabado", "domingo", "feriado"],
        texto: `O atendimento é de ${SITE.horario.charAt(0).toLowerCase() + SITE.horario.slice(1)}. Pelo WhatsApp você pode mandar mensagem a qualquer hora.`,
        links: [whats()],
      },
      {
        id: "creci",
        chaves: ["creci", "registrado", "confiavel", "seguro", "seguranca", "golpe"],
        texto: `O Gustavo é corretor de imóveis registrado no ${SITE.creci}. Todas as negociações têm análise de documentação e contrato, e nenhum pagamento é pedido antes da assinatura.`,
      },
      {
        id: "contato",
        chaves: ["falar", "corretor", "gustavo", "whats", "telefon", "contato", "ligar", "atendent", "humano", "pessoa"],
        texto: `Você pode falar diretamente com o Gustavo pelo WhatsApp ${SITE.whatsappExibicao}.`,
        links: [whats(), { rotulo: "Página de contato", href: "/contato/" }],
      },
      {
        id: "agradecimento",
        chaves: ["obrigad", "valeu", "brigad", "agradec"],
        texto: "Por nada! Se precisar de mais alguma coisa, é só chamar.",
        sugestoes: SUGESTOES.slice(0, 3),
      },
      {
        id: "saudacao",
        chaves: ["oi", "ola", "bom dia", "boa tarde", "boa noite", "eai", "opa", "tudo bem"],
        texto: "Olá! Me diga o que você procura: tipo de imóvel, cidade e valor. Ou escolha uma das opções.",
        sugestoes: SUGESTOES,
      },
    ],
  };
}
