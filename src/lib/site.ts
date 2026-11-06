export const SITE = {
  nome: "GG Imóveis Litoral",
  url: "https://ggimoveislitoral.com.br", // provisório até a escolha do domínio
  descricao:
    "Corretor de imóveis em Santos, São Vicente, Praia Grande e Guarujá. Apartamentos, coberturas e casas no litoral paulista, com atendimento direto pelo WhatsApp.",
  whatsapp: "5513997771730",
  whatsappExibicao: "(13) 99777-1730",
  email: "contato@ggimoveislitoral.com.br", // provisório
  creci: "CRECI-SP (a informar)",
  horario: "Segunda a sábado, das 9h às 19h",
};

export function linkWhatsApp(mensagem?: string) {
  const texto = mensagem ?? "Olá! Vim pelo site da GG Imóveis Litoral e gostaria de atendimento.";
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(texto)}`;
}

export const formatarPreco = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
