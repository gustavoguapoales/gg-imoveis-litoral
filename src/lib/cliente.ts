import { visitaAtual } from "@/components/Rastreador";

// Envia o cliente para o banco do site sem atrasar a abertura do WhatsApp (keepalive: completa mesmo se a página mudar).
export type DadosCliente = {
  nome: string; telefone: string; email?: string; interesse: string;
  ref?: string; cidade?: string; bairro?: string; finalidade?: string; mensagem?: string;
};

export function registrarCliente(d: DadosCliente) {
  try {
    fetch("/api/clientes/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...d, pagina: window.location.pathname, sessao: visitaAtual()?.sessao ?? "" }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
