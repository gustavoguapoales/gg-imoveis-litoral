// DADOS PRIVADOS DE DEMONSTRAÇÃO — fictícios, apenas para o protótipo do painel.
// Na versão final estes dados ficam no banco de dados (Cloudflare D1), protegidos por login,
// e NUNCA entram no código nem no GitHub.

export type StatusImovel = "Disponível" | "Reservado" | "Vendido" | "Alugado" | "Suspenso";
export const STATUS: StatusImovel[] = ["Disponível", "Reservado", "Vendido", "Alugado", "Suspenso"];
export const LOCAIS_CHAVES = ["Com o corretor", "Com o proprietário", "Na portaria", "Com o caseiro", "Outro"];

export interface DadosPrivados {
  status: StatusImovel;
  endereco: string; // rua e número
  complemento: string; // apto, bloco, casa
  cep: string;
  proprietario: string;
  telefone: string;
  email: string;
  chaves: string;
  chavesObs: string;
  comissao: string;
  exclusividade: boolean;
  exclusividadeAte: string; // AAAA-MM-DD
  captadoEm: string; // AAAA-MM-DD
  observacoes: string;
}

// Datas relativas a hoje, para o protótipo sempre mostrar exclusividades a vencer.
const dia = (deslocamento: number) => {
  const d = new Date();
  d.setDate(d.getDate() + deslocamento);
  return d.toISOString().slice(0, 10);
};

const base = (p: Partial<DadosPrivados>): DadosPrivados => ({
  status: "Disponível", endereco: "", complemento: "", cep: "", proprietario: "", telefone: "", email: "",
  chaves: "Com o corretor", chavesObs: "", comissao: "6%", exclusividade: false, exclusividadeAte: "", captadoEm: dia(-30), observacoes: "", ...p,
});

export const privadosDemo: Record<string, DadosPrivados> = {
  "GG-0142": base({ endereco: "Av. Presidente Wilson, 1250", complemento: "Apto 141", cep: "11065-200", proprietario: "Maria Aparecida Souza", telefone: "(13) 90000-0101", email: "maria.souza@example.com", exclusividade: true, exclusividadeAte: dia(120), captadoEm: dia(-40), observacoes: "Aceita proposta a partir de R$ 1,3 milhão. Visitas somente à tarde." }),
  "GG-0157": base({ endereco: "Av. Bartolomeu de Gusmão, 180", complemento: "Cobertura 2101", cep: "11030-500", proprietario: "Carlos Eduardo Lima", telefone: "(13) 90000-0102", chaves: "Na portaria", chavesObs: "Retirar com o zelador, Sr. Antônio.", comissao: "5%", exclusividade: true, exclusividadeAte: dia(18), captadoEm: dia(-160), observacoes: "Aceita permuta por imóvel menor em São Paulo." }),
  "GG-0163": base({ endereco: "Rua Japão, 410", complemento: "Apto 82", cep: "11702-110", proprietario: "Fernanda Ribeiro", telefone: "(13) 90000-0103", chaves: "Com o proprietário", captadoEm: dia(-12), observacoes: "Imóvel ocupado pela proprietária. Avisar com 1 dia de antecedência." }),
  "GG-0171": base({ endereco: "Alameda das Palmeiras, 55", complemento: "Casa", cep: "11442-000", proprietario: "Roberto Almeida", telefone: "(11) 90000-0104", email: "roberto.almeida@example.com", chaves: "Com o caseiro", chavesObs: "Caseiro Sr. João abre o imóvel.", comissao: "5%", exclusividade: true, exclusividadeAte: dia(200), captadoEm: dia(-25), observacoes: "Valor negociável para pagamento à vista." }),
  "GG-0128": base({ endereco: "Rua Luiz Suplicy, 88", complemento: "Apto 33", cep: "11045-560", proprietario: "Ana Paula Martins", telefone: "(13) 90000-0105", exclusividade: true, exclusividadeAte: dia(25), captadoEm: dia(-65), observacoes: "Reformado em 2025. Aceita financiamento." }),
  "GG-0134": base({ endereco: "Av. Ayrton Senna da Silva, 900", complemento: "Apto 54", cep: "11320-000", proprietario: "José Carlos Pereira", telefone: "(13) 90000-0106", chaves: "Na portaria", captadoEm: dia(-8) }),
  "GG-0149": base({ status: "Reservado", endereco: "Rua Mário Ribeiro, 230", complemento: "Apto 71", cep: "11410-010", proprietario: "Luciana Ferreira", telefone: "(13) 90000-0107", captadoEm: dia(-90), observacoes: "Proposta aceita em análise de crédito. Aguardar banco." }),
  "GG-0166": base({ status: "Vendido", endereco: "Rua Peru, 1020", complemento: "Apto 24", cep: "11701-300", proprietario: "Marcos Vinícius Rocha", telefone: "(13) 90000-0108", captadoEm: dia(-140), observacoes: "Vendido. Escritura marcada para o próximo mês." }),
  "GG-0175": base({ endereco: "Rua Oswaldo Cruz, 300", complemento: "Studio 1203", cep: "11045-100", proprietario: "Patrícia Gomes", telefone: "(11) 90000-0109", comissao: "6%", captadoEm: dia(-3), observacoes: "Mobília inclusa no valor." }),
  "GG-0181": base({ endereco: "Rua das Gaivotas, 77", complemento: "Casa", cep: "11740-000", proprietario: "Sérgio Nunes", telefone: "(13) 90000-0110", chaves: "Com o proprietário", exclusividade: true, exclusividadeAte: dia(9), captadoEm: dia(-80) }),
  "GG-0184": base({ endereco: "Av. Washington Luiz, 450", complemento: "Apto 32", cep: "11740-001", proprietario: "Cláudia Moreira", telefone: "(13) 90000-0111", comissao: "1º aluguel", captadoEm: dia(-15), observacoes: "Exige fiador ou seguro-fiança." }),
  "GG-0187": base({ endereco: "Rua São Paulo, 150", complemento: "Apto 12", cep: "11730-000", proprietario: "Eduardo Santos", telefone: "(13) 90000-0112", captadoEm: dia(-50) }),
  "GG-0189": base({ status: "Alugado", endereco: "Rua Bahia, 640", complemento: "Casa", cep: "11730-200", proprietario: "Regina Alves", telefone: "(13) 90000-0113", comissao: "1º aluguel", captadoEm: dia(-120), observacoes: "Alugado. Contrato de 30 meses." }),
  "GG-0192": base({ endereco: "Av. Ana Costa, 500", complemento: "Sala 1504", cep: "11060-000", proprietario: "Grupo Litoral Participações", telefone: "(13) 90000-0114", email: "contato@example.com", chaves: "Na portaria", comissao: "1º aluguel", captadoEm: dia(-20) }),
  "GG-0195": base({ endereco: "Rua XV de Novembro, 95", complemento: "Loja", cep: "11010-150", proprietario: "Antônio Batista", telefone: "(13) 90000-0115", chaves: "Com o corretor", captadoEm: dia(-35), observacoes: "Imóvel tombado na fachada. Verificar regras do Condephaat." }),
};
