import { cidades, imoveis } from "@/data/imoveis";
import { linkDrone } from "./drone";
import { linkWhatsApp, SITE } from "./site";
import { normalizar, type DadosChat } from "./chatbot";

const SUGESTOES = ["Quero comprar", "Quero alugar", "Anunciar meu imóvel", "Avaliar meu imóvel", "Filmagem com drone", "Falar com o Gustavo"];
const whats = (msg?: string) => ({ rotulo: "Falar com o Gustavo no WhatsApp", href: linkWhatsApp(msg), externo: true });

export function montarDadosChat(): DadosChat {
  const nomesCidades = cidades.map((c) => c.nome).join(", ").replace(/, ([^,]*)$/, " e $1");
  return {
    whatsapp: linkWhatsApp("Olá, Gustavo! Vim pelo assistente do site e gostaria de atendimento."),
    boasVindas: {
      texto: "Olá! Sou o assistente virtual da GG Imóveis Litoral. Posso ajudar você a encontrar um imóvel, anunciar o seu ou tirar dúvidas. Como posso ajudar?",
      sugestoes: SUGESTOES,
    },
    naoEntendi: {
      texto: "Não consegui entender sua pergunta. Escolha uma das opções abaixo ou fale direto com o Gustavo, que responde pessoalmente.",
      links: [whats("Olá, Gustavo! Vim pelo site e tenho uma dúvida.")],
      sugestoes: SUGESTOES,
    },
    cidades: cidades.map((c) => ({
      nome: c.nome,
      slug: c.slug,
      venda: imoveis.filter((i) => i.cidade === c.nome && i.finalidade === "venda").length,
      aluguel: imoveis.filter((i) => i.cidade === c.nome && i.finalidade === "aluguel").length,
      chaves: [normalizar(c.nome), ...(c.slug === "praia-grande" ? ["pg"] : [])],
    })),
    // A ordem desempata: as intenções mais específicas vêm primeiro.
    intencoes: [
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
        chaves: ["anunci", "vender meu", "vender minha", "alugar meu", "alugar minha", "meu imovel", "minha casa", "meu apartamento", "proprietari", "cadastrar"],
        texto: "Ótimo! Você pode cadastrar seu imóvel para vender ou alugar. Anunciar não tem custo: o Gustavo cuida das fotos, do anúncio e do atendimento dos interessados.",
        links: [{ rotulo: "Anunciar meu imóvel", href: "/anunciar/" }],
        sugestoes: ["Quanto custa anunciar?", "Avaliar meu imóvel"],
      },
      {
        id: "custos",
        chaves: ["comiss", "taxa", "custa anunciar", "cobra", "gratuit", "quanto custa"],
        texto: "Anunciar e avaliar são gratuitos. A comissão de corretagem só é cobrada quando o negócio é fechado. O Gustavo explica os detalhes pessoalmente.",
        links: [whats("Olá, Gustavo! Gostaria de saber sobre a comissão de corretagem.")],
      },
      {
        id: "financiamento",
        chaves: ["financ", "fgts", "banco", "caixa", "parcel", "entrada", "credito"],
        texto: "O Gustavo ajuda na simulação e na aprovação do financiamento bancário, inclusive com uso do FGTS quando as regras permitem. Chame no WhatsApp para fazer uma simulação.",
        links: [whats("Olá, Gustavo! Gostaria de simular um financiamento.")],
      },
      {
        id: "documentos",
        chaves: ["document", "escritur", "matricul", "certid", "itbi", "cartorio", "contrato"],
        texto: "O Gustavo cuida da análise da matrícula, das certidões e do contrato, e acompanha a escritura e o registro até a entrega das chaves.",
        links: [whats("Olá, Gustavo! Tenho uma dúvida sobre documentação.")],
      },
      {
        id: "visita",
        chaves: ["visit", "agend", "conhecer o imovel", "ver o imovel", "ver pessoalmente"],
        texto: "As visitas são agendadas pelo WhatsApp e acompanhadas pelo Gustavo. Também é possível conhecer o imóvel por chamada de vídeo.",
        links: [whats("Olá, Gustavo! Gostaria de agendar uma visita.")],
      },
      {
        id: "alugar",
        chaves: ["alug", "locac", "inquilin"],
        texto: "Veja os imóveis disponíveis para alugar. Se me disser a cidade, mostro as opções de lá.",
        links: [{ rotulo: "Ver imóveis para alugar", href: "/imoveis/?finalidade=aluguel" }],
        sugestoes: cidades.slice(0, 4).map((c) => `Alugar em ${c.nome}`),
      },
      {
        id: "comprar",
        chaves: ["compr", "procur", "busc", "apartament", "cobertura", "studio", "sala comercial", "imoveis a venda"],
        texto: "Veja os imóveis à venda. Se me disser a cidade, mostro as opções de lá.",
        links: [{ rotulo: "Ver imóveis à venda", href: "/imoveis/?finalidade=venda" }],
        sugestoes: cidades.slice(0, 4).map((c) => `Comprar em ${c.nome}`),
      },
      {
        id: "cidades",
        chaves: ["cidade", "regi", "atende", "atua", "bairro", "litoral"],
        texto: `A GG Imóveis Litoral atende ${nomesCidades}. Qual cidade você procura?`,
        links: [{ rotulo: "Ver as regiões", href: "/#regioes" }],
        sugestoes: cidades.map((c) => c.nome),
      },
      {
        id: "horario",
        chaves: ["horari", "abert", "funcion", "sabado", "domingo"],
        texto: `O atendimento é de ${SITE.horario.charAt(0).toLowerCase() + SITE.horario.slice(1)}. Pelo WhatsApp você pode mandar mensagem a qualquer hora.`,
        links: [whats()],
      },
      {
        id: "creci",
        chaves: ["creci", "registr", "confiavel", "seguro", "seguranca"],
        texto: `O Gustavo é corretor de imóveis registrado no ${SITE.creci}. Todas as negociações têm análise de documentação e contrato.`,
      },
      {
        id: "contato",
        chaves: ["falar", "corretor", "gustavo", "whats", "telefon", "contato", "ligar", "atendent", "humano", "pessoa"],
        texto: `Você pode falar diretamente com o Gustavo pelo WhatsApp ${SITE.whatsappExibicao}.`,
        links: [whats(), { rotulo: "Página de contato", href: "/contato/" }],
      },
      {
        id: "agradecimento",
        chaves: ["obrigad", "valeu", "brigad", "ok", "certo", "show"],
        texto: "Por nada! Se precisar de mais alguma coisa, é só chamar.",
        sugestoes: SUGESTOES.slice(0, 3),
      },
      {
        id: "saudacao",
        chaves: ["oi", "ola", "bom dia", "boa tarde", "boa noite", "eai", "opa"],
        texto: "Olá! Em que posso ajudar? Você pode escolher uma opção ou escrever sua dúvida.",
        sugestoes: SUGESTOES,
      },
    ],
  };
}
