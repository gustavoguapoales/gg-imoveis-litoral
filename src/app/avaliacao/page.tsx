import type { Metadata } from "next";
import { FormWhatsApp } from "@/components/FormWhatsApp";
import { IconeCheck } from "@/components/Icones";

export const metadata: Metadata = {
  title: "Avaliação de imóvel gratuita",
  description: "Descubra quanto vale seu imóvel no litoral paulista. Avaliação com base em negócios reais do bairro, sem custo e sem compromisso.",
  alternates: { canonical: "/avaliacao/" },
};

const CRITERIOS = ["Vendas e aluguéis recentes no mesmo bairro", "Metragem, andar, vista e posição solar", "Estado de conservação e reformas", "Lazer e custo do condomínio", "Distância da praia e do comércio"];

export default function PaginaAvaliacao() {
  return (
    <div className="pb-28 pt-32 md:pt-40">
      <div className="container-site grid gap-16 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="rotulo text-latao-escuro">Avaliação gratuita</p>
          <h1 className="mt-3 font-display text-5xl leading-tight md:text-6xl">Quanto vale o seu imóvel hoje?</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-cinza">
            Uma avaliação bem feita evita dois erros: anunciar caro e o imóvel ficar parado, ou anunciar barato e perder dinheiro.
          </p>
          <ul className="mt-8 max-w-md space-y-2.5">
            {CRITERIOS.map((c) => (<li key={c} className="flex items-start gap-3"><IconeCheck className="mt-0.5 shrink-0 text-mar" /> {c}</li>))}
          </ul>

          <div className="mt-12 max-w-md">
            <p className="rotulo text-cinza">Exemplo de avaliação</p>
            <div className="mt-3 rounded-sm border border-linha bg-papel p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl">Apartamento no Embaré, Santos</p>
                  <p className="mt-1 text-sm text-cinza">78 m² · 2 dormitórios · 1 vaga · reformado</p>
                </div>
                <span className="rounded-full bg-latao/25 px-3 py-1 text-xs font-semibold text-latao-escuro">Exemplo</span>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-linha pt-5 text-sm">
                <div><dt className="text-cinza">Faixa de venda</dt><dd className="mt-1 text-lg font-semibold tabular-nums">R$ 610 a 660 mil</dd></div>
                <div><dt className="text-cinza">Aluguel estimado</dt><dd className="mt-1 text-lg font-semibold tabular-nums">R$ 3.000 a 3.400</dd></div>
                <div><dt className="text-cinza">m² no bairro</dt><dd className="mt-1 font-medium tabular-nums">R$ 8.100</dd></div>
                <div><dt className="text-cinza">Prazo médio de venda</dt><dd className="mt-1 font-medium">90 a 120 dias</dd></div>
              </dl>
              <p className="mt-4 text-xs text-cinza">Valores ilustrativos. Cada avaliação é feita a partir dos dados reais do seu imóvel.</p>
            </div>
          </div>
        </div>

        <div className="self-start rounded-sm border border-linha bg-nevoa p-6 md:p-10">
          <h2 className="font-display text-3xl">Solicite sua avaliação</h2>
          <p className="mt-2 text-cinza">Retorno em até 1 dia útil, sem custo e sem compromisso.</p>
          <div className="mt-8">
            <FormWhatsApp
              id="avaliacao"
              interesse="Avaliação de imóvel"
              cabecalho="Olá! Gostaria de uma avaliação do meu imóvel."
              botao="Pedir avaliação"
              campos={[
                { nome: "objetivo", rotulo: "Objetivo", tipo: "select", opcoes: ["Vender", "Alugar", "Só saber o valor"] },
                { nome: "tipo", rotulo: "Tipo de imóvel", tipo: "select", opcoes: ["Apartamento", "Casa", "Cobertura", "Studio", "Sala comercial", "Terreno"] },
                { nome: "cidade", rotulo: "Cidade", tipo: "select", opcoes: ["Santos", "São Vicente", "Praia Grande", "Guarujá", "Mongaguá", "Itanhaém", "Outra"] },
                { nome: "bairro", rotulo: "Bairro", obrigatorio: true },
                { nome: "area", rotulo: "Área útil (m²)", tipo: "number" },
                { nome: "dormitorios", rotulo: "Dormitórios", tipo: "select", opcoes: ["Nenhum", "1", "2", "3", "4 ou mais"] },
                { nome: "conservacao", rotulo: "Estado de conservação", tipo: "select", opcoes: ["Bom", "Reformado", "Precisa de reforma", "Novo"] },
                { nome: "vista", rotulo: "Vista para o mar?", tipo: "select", opcoes: ["Não", "Sim, frente mar", "Sim, vista parcial"] },
                { nome: "nome", rotulo: "Seu nome", obrigatorio: true },
                { nome: "telefone", rotulo: "Telefone / WhatsApp", tipo: "tel", obrigatorio: true, placeholder: "(13) 90000-0000" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
