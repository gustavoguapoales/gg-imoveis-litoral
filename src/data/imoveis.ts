// IMÓVEIS DE DEMONSTRAÇÃO — dados fictícios para o protótipo.
// Substituir pelos imóveis reais (e fotos reais) antes da publicação.

export type Cidade = "Santos" | "São Vicente" | "Praia Grande" | "Guarujá";
export type Tipo = "Apartamento" | "Cobertura" | "Casa" | "Studio";

export interface Imovel {
  slug: string;
  ref: string;
  titulo: string;
  tipo: Tipo;
  cidade: Cidade;
  bairro: string;
  preco: number;
  condominio?: number;
  iptu?: number;
  area: number;
  dormitorios: number;
  suites: number;
  banheiros: number;
  vagas: number;
  distanciaPraia: number; // em metros
  vistaMar: boolean;
  destaque: boolean;
  resumo: string;
  descricao: string[];
  caracteristicas: string[];
  lazer: string[];
  imagens: string[];
}

const img = (n: string) => `/ilustracoes/${n}.svg`;

export const imoveis: Imovel[] = [
  {
    slug: "apartamento-frente-mar-gonzaga-santos",
    ref: "GG-0142",
    titulo: "Apartamento frente mar no Gonzaga",
    tipo: "Apartamento",
    cidade: "Santos",
    bairro: "Gonzaga",
    preco: 1350000,
    condominio: 1650,
    iptu: 420,
    area: 128,
    dormitorios: 3,
    suites: 1,
    banheiros: 3,
    vagas: 2,
    distanciaPraia: 40,
    vistaMar: true,
    destaque: true,
    resumo: "Andar alto, sala ampla com sacada voltada para a orla e o jardim da praia.",
    descricao: [
      "Apartamento em andar alto, de frente para o jardim da orla do Gonzaga. A sala em dois ambientes se abre para uma sacada com vista direta para o mar e recebe sol da manhã.",
      "São três dormitórios, sendo uma suíte com closet, cozinha planejada, área de serviço independente e dependência completa. O prédio tem portaria 24 horas e duas vagas demarcadas.",
      "A localização permite fazer quase tudo a pé: praia, comércio da Ana Costa, restaurantes, bancos e o canal 3 a poucos minutos.",
    ],
    caracteristicas: ["Vista mar", "Sacada", "Suíte com closet", "Cozinha planejada", "Dependência completa", "Sol da manhã", "Portaria 24h", "Andar alto"],
    lazer: ["Salão de festas", "Academia", "Bicicletário"],
    imagens: [img("orla-dia"), img("sala-dia"), img("fachada-dia"), img("orla-noite")],
  },
  {
    slug: "cobertura-duplex-ponta-da-praia-santos",
    ref: "GG-0157",
    titulo: "Cobertura duplex na Ponta da Praia",
    tipo: "Cobertura",
    cidade: "Santos",
    bairro: "Ponta da Praia",
    preco: 2890000,
    condominio: 2900,
    iptu: 980,
    area: 240,
    dormitorios: 4,
    suites: 3,
    banheiros: 5,
    vagas: 3,
    distanciaPraia: 120,
    vistaMar: true,
    destaque: true,
    resumo: "Terraço com piscina privativa e vista para a entrada do canal do porto.",
    descricao: [
      "Cobertura duplex com terraço gourmet, piscina privativa e vista para o mar e para a entrada do porto, onde se acompanha a passagem dos navios.",
      "No primeiro piso ficam a sala de estar e jantar, lavabo, cozinha e três suítes. O segundo piso é dedicado ao lazer, com churrasqueira, piscina e uma quarta suíte.",
      "Prédio com poucas unidades por andar, três vagas e depósito privativo.",
    ],
    caracteristicas: ["Vista mar", "Piscina privativa", "Terraço gourmet", "Churrasqueira", "Lavabo", "Depósito privativo", "Ar-condicionado"],
    lazer: ["Piscina", "Academia", "Salão de festas", "Playground"],
    imagens: [img("piscina-entardecer"), img("sala-entardecer"), img("orla-amanhecer"), img("fachada-entardecer")],
  },
  {
    slug: "apartamento-praia-grande-canto-do-forte",
    ref: "GG-0163",
    titulo: "Apartamento com lazer completo no Canto do Forte",
    tipo: "Apartamento",
    cidade: "Praia Grande",
    bairro: "Canto do Forte",
    preco: 980000,
    condominio: 1100,
    iptu: 260,
    area: 115,
    dormitorios: 3,
    suites: 2,
    banheiros: 3,
    vagas: 2,
    distanciaPraia: 150,
    vistaMar: true,
    destaque: true,
    resumo: "Prédio novo, varanda gourmet e lazer de clube a uma quadra da praia.",
    descricao: [
      "Apartamento em prédio recente no Canto do Forte, o bairro mais valorizado de Praia Grande. Varanda gourmet com churrasqueira e vista lateral para o mar.",
      "Três dormitórios, sendo duas suítes, sala integrada à varanda e cozinha americana. Duas vagas cobertas.",
      "O condomínio oferece lazer completo para a família, a uma quadra da praia e perto da Fortaleza de Itaipu.",
    ],
    caracteristicas: ["Varanda gourmet", "Vista mar lateral", "Duas suítes", "Cozinha americana", "Vagas cobertas", "Prédio novo"],
    lazer: ["Piscina adulto e infantil", "Academia", "Espaço gourmet", "Brinquedoteca", "Quadra"],
    imagens: [img("piscina-dia"), img("sala-amanhecer"), img("praia-grande"), img("fachada-amanhecer")],
  },
  {
    slug: "casa-condominio-jardim-acapulco-guaruja",
    ref: "GG-0171",
    titulo: "Casa em condomínio no Jardim Acapulco",
    tipo: "Casa",
    cidade: "Guarujá",
    bairro: "Jardim Acapulco",
    preco: 6500000,
    condominio: 4200,
    iptu: 1900,
    area: 520,
    dormitorios: 5,
    suites: 5,
    banheiros: 7,
    vagas: 6,
    distanciaPraia: 350,
    vistaMar: false,
    destaque: true,
    resumo: "Arquitetura contemporânea, cinco suítes e piscina em condomínio fechado.",
    descricao: [
      "Casa contemporânea em condomínio fechado com segurança 24 horas, a poucos minutos da praia de Pernambuco.",
      "Térrea com grandes vãos envidraçados que integram as salas ao jardim e à piscina aquecida. São cinco suítes, escritório, adega e espaço gourmet.",
      "Lote amplo com paisagismo, garagem para seis carros e casa de caseiro.",
    ],
    caracteristicas: ["Cinco suítes", "Piscina aquecida", "Espaço gourmet", "Escritório", "Adega", "Casa de caseiro", "Energia solar"],
    lazer: ["Segurança 24h", "Quadra de tênis", "Área verde"],
    imagens: [img("casa-dia"), img("casa-entardecer"), img("sala-noite"), img("piscina-dia")],
  },
  {
    slug: "apartamento-embare-santos",
    ref: "GG-0128",
    titulo: "Apartamento reformado no Embaré",
    tipo: "Apartamento",
    cidade: "Santos",
    bairro: "Embaré",
    preco: 640000,
    condominio: 780,
    iptu: 190,
    area: 78,
    dormitorios: 2,
    suites: 1,
    banheiros: 2,
    vagas: 1,
    distanciaPraia: 300,
    vistaMar: false,
    destaque: false,
    resumo: "Reformado, planta bem distribuída e a três quadras da praia.",
    descricao: [
      "Apartamento totalmente reformado, com piso vinílico, iluminação nova e armários planejados na cozinha e nos dormitórios.",
      "Dois dormitórios, sendo uma suíte, sala para dois ambientes e uma vaga. Rua tranquila e arborizada.",
    ],
    caracteristicas: ["Reformado", "Armários planejados", "Suíte", "Rua arborizada"],
    lazer: ["Salão de festas"],
    imagens: [img("sala-dia"), img("fachada-dia"), img("orla-dia")],
  },
  {
    slug: "apartamento-frente-mar-itarare-sao-vicente",
    ref: "GG-0134",
    titulo: "Frente mar na praia do Itararé",
    tipo: "Apartamento",
    cidade: "São Vicente",
    bairro: "Itararé",
    preco: 520000,
    condominio: 690,
    iptu: 150,
    area: 72,
    dormitorios: 2,
    suites: 0,
    banheiros: 1,
    vagas: 1,
    distanciaPraia: 30,
    vistaMar: true,
    destaque: true,
    resumo: "Sacada de frente para o mar e a Ilha Porchat, pronto para morar.",
    descricao: [
      "Apartamento de frente para a praia do Itararé, com sacada voltada para o mar e para a Ilha Porchat.",
      "Dois dormitórios, sala ampla, cozinha e área de serviço. Ótima opção para morar ou para temporada.",
    ],
    caracteristicas: ["Vista mar", "Sacada", "Pronto para morar", "Bom para temporada"],
    lazer: ["Piscina", "Salão de festas"],
    imagens: [img("sao-vicente"), img("sala-amanhecer"), img("orla-amanhecer")],
  },
  {
    slug: "apartamento-pitangueiras-guaruja",
    ref: "GG-0149",
    titulo: "Apartamento a uma quadra das Pitangueiras",
    tipo: "Apartamento",
    cidade: "Guarujá",
    bairro: "Pitangueiras",
    preco: 850000,
    condominio: 1250,
    iptu: 310,
    area: 110,
    dormitorios: 3,
    suites: 1,
    banheiros: 2,
    vagas: 2,
    distanciaPraia: 100,
    vistaMar: false,
    destaque: false,
    resumo: "Amplo, ventilado e perto do comércio e da praia mais conhecida do Guarujá.",
    descricao: [
      "Apartamento amplo e ventilado a uma quadra da praia das Pitangueiras, perto de restaurantes, padarias e do comércio do centro do Guarujá.",
      "Três dormitórios, sendo uma suíte, sala com sacada e duas vagas.",
    ],
    caracteristicas: ["Sacada", "Suíte", "Ventilação cruzada", "Perto do comércio"],
    lazer: ["Piscina", "Churrasqueira"],
    imagens: [img("guaruja"), img("sala-noite"), img("fachada-entardecer")],
  },
  {
    slug: "apartamento-guilhermina-praia-grande",
    ref: "GG-0166",
    titulo: "Apartamento na Guilhermina com varanda",
    tipo: "Apartamento",
    cidade: "Praia Grande",
    bairro: "Guilhermina",
    preco: 425000,
    condominio: 620,
    iptu: 120,
    area: 68,
    dormitorios: 2,
    suites: 1,
    banheiros: 2,
    vagas: 1,
    distanciaPraia: 200,
    vistaMar: false,
    destaque: false,
    resumo: "Varanda com churrasqueira e condomínio com piscina, perto da praia.",
    descricao: [
      "Apartamento com varanda e churrasqueira, a duas quadras da praia da Guilhermina.",
      "Dois dormitórios, sendo uma suíte, e uma vaga. Condomínio com piscina e salão de festas.",
    ],
    caracteristicas: ["Varanda com churrasqueira", "Suíte", "Aceita financiamento"],
    lazer: ["Piscina", "Salão de festas"],
    imagens: [img("orla-dia"), img("sala-dia"), img("piscina-dia")],
  },
  {
    slug: "studio-boqueirao-santos",
    ref: "GG-0175",
    titulo: "Studio mobiliado no Boqueirão",
    tipo: "Studio",
    cidade: "Santos",
    bairro: "Boqueirão",
    preco: 395000,
    condominio: 540,
    iptu: 95,
    area: 42,
    dormitorios: 1,
    suites: 1,
    banheiros: 1,
    vagas: 1,
    distanciaPraia: 250,
    vistaMar: false,
    destaque: false,
    resumo: "Mobiliado e decorado, ideal para investimento em locação.",
    descricao: [
      "Studio mobiliado e decorado em prédio novo no Boqueirão, perto da praia, de universidades e do comércio.",
      "Boa opção para quem busca renda com locação de longa ou curta temporada.",
    ],
    caracteristicas: ["Mobiliado", "Prédio novo", "Bom para investimento"],
    lazer: ["Coworking", "Lavanderia", "Academia"],
    imagens: [img("sala-entardecer"), img("fachada-amanhecer"), img("santos")],
  },
];

export const cidades: { nome: Cidade; slug: string; imagem: string; coordenadas: string; texto: string; bairros: string[] }[] = [
  {
    nome: "Santos",
    slug: "santos",
    imagem: img("santos"),
    coordenadas: "23°57′S · 46°19′O",
    texto: "A maior orla ajardinada do país, com infraestrutura completa e bairros para todos os perfis.",
    bairros: ["Gonzaga", "Boqueirão", "Embaré", "Aparecida", "Ponta da Praia", "José Menino"],
  },
  {
    nome: "São Vicente",
    slug: "sao-vicente",
    imagem: img("sao-vicente"),
    coordenadas: "23°58′S · 46°23′O",
    texto: "A primeira vila do Brasil, com praias tranquilas e ótimo custo-benefício perto de Santos.",
    bairros: ["Itararé", "Gonzaguinha", "Centro", "Boa Vista"],
  },
  {
    nome: "Praia Grande",
    slug: "praia-grande",
    imagem: img("praia-grande"),
    coordenadas: "24°00′S · 46°24′O",
    texto: "Prédios novos com lazer completo e uma orla extensa, muito procurada por famílias.",
    bairros: ["Canto do Forte", "Boqueirão", "Guilhermina", "Aviação", "Tupi", "Ocian"],
  },
  {
    nome: "Guarujá",
    slug: "guaruja",
    imagem: img("guaruja"),
    coordenadas: "23°59′S · 46°15′O",
    texto: "Praias famosas, condomínios de alto padrão e o melhor do litoral para veraneio.",
    bairros: ["Pitangueiras", "Enseada", "Astúrias", "Tombo", "Jardim Acapulco", "Pernambuco"],
  },
];

export const tipos: Tipo[] = ["Apartamento", "Cobertura", "Casa", "Studio"];

export const getImovel = (slug: string) => imoveis.find((i) => i.slug === slug);
