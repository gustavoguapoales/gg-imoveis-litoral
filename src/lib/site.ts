export const SITE = {
  nome: "GG Imóveis Litoral",
  url: "https://ggimoveislitoral.com.br", // provisório até a escolha do domínio
  // false enquanto o site tem imóveis de exemplo: pede ao Google para não indexar.
  // Mudar para true quando o domínio e os imóveis reais estiverem no ar.
  indexar: false,
  descricao:
    "Corretor de imóveis no litoral paulista: Santos, São Vicente, Praia Grande, Guarujá, Mongaguá e Itanhaém. Compra, venda e aluguel, com atendimento direto pelo WhatsApp.",
  whatsapp: "5513997771730",
  whatsappExibicao: "(13) 99777-1730",
  email: "contato@ggimoveislitoral.com.br", // provisório
  creci: "CRECI-SP 323268",
  horario: "Segunda a sábado, das 9h às 19h",
};

export function linkWhatsApp(mensagem?: string) {
  const texto = mensagem ?? "Olá! Vim pelo site da GG Imóveis Litoral e gostaria de atendimento.";
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(texto)}`;
}

export const formatarPreco = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const precoImovel = (i: { preco: number; finalidade: "venda" | "aluguel" }) =>
  i.finalidade === "aluguel" ? `${formatarPreco(i.preco)}/mês` : formatarPreco(i.preco);
