import type { Metadata } from "next";
import { FormWhatsApp } from "@/components/FormWhatsApp";
import { IconeArea, IconeBanho, IconeCama, IconeCheck, IconeVaga } from "@/components/Icones";

export const metadata: Metadata = {
  title: "Anuncie seu imóvel para vender ou alugar",
  description: "Quer vender ou alugar seu imóvel no litoral paulista? Cadastre os dados e a GG Imóveis Litoral cuida das fotos, do anúncio e do atendimento.",
  alternates: { canonical: "/anunciar/" },
};

const ETAPAS = [
  { titulo: "Você envia os dados", texto: "Preencha o formulário. As fotos podem ir depois, direto pelo WhatsApp." },
  { titulo: "Visita e avaliação", texto: "Visito o imóvel, confirmo as informações e sugiro o valor de mercado." },
  { titulo: "Anúncio no ar", texto: "Fotos profissionais, anúncio aqui no site, nos portais e nas redes sociais." },
];

export default function PaginaAnunciar() {
  return (
    <div className="pb-28 pt-32 md:pt-40">
      <div className="container-site grid gap-16 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="rotulo text-latao-escuro">Para proprietários</p>
          <h1 className="mt-3 font-display text-5xl leading-tight md:text-6xl">Anuncie seu imóvel para vender ou alugar.</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-cinza">
            Cadastre seu imóvel em poucos minutos. Eu cuido da divulgação e do atendimento dos interessados, com segurança em cada etapa.
          </p>
          <ol className="mt-10 grid max-w-md gap-6">
            {ETAPAS.map((e, k) => (
              <li key={e.titulo} className="border-t border-tinta/15 pt-4">
                <span className="rotulo text-latao-escuro">Etapa {k + 1}</span>
                <p className="mt-1 font-display text-xl">{e.titulo}</p>
                <p className="mt-1 text-sm text-cinza">{e.texto}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 max-w-md">
            <p className="rotulo text-cinza">Exemplo de anúncio</p>
            <div className="mt-3 overflow-hidden rounded-sm border border-linha bg-papel">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fotos/varanda-gourmet.jpg" alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />
              <div className="p-5">
                <p className="rotulo text-cinza">Aparecida · Santos</p>
                <p className="mt-1 font-display text-xl">Apartamento com varanda gourmet</p>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-cinza">
                  <li className="flex items-center gap-1.5"><IconeArea width={16} height={16} /> 96 m²</li>
                  <li className="flex items-center gap-1.5"><IconeCama width={16} height={16} /> 3 dorm.</li>
                  <li className="flex items-center gap-1.5"><IconeBanho width={16} height={16} /> 2 banh.</li>
                  <li className="flex items-center gap-1.5"><IconeVaga width={16} height={16} /> 2 vagas</li>
                </ul>
                <p className="mt-3 text-lg font-semibold">R$ 890.000</p>
              </div>
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              {["Sem custo para anunciar", "Você aprova o anúncio antes de publicar", "Comissão só quando o negócio fechar"].map((t) => (
                <li key={t} className="flex items-center gap-2"><IconeCheck className="text-mar" /> {t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="self-start rounded-sm border border-linha bg-nevoa p-6 md:p-10">
          <h2 className="font-display text-3xl">Dados do imóvel</h2>
          <p className="mt-2 text-cinza">Quanto mais detalhes, mais rápido eu preparo o anúncio.</p>
          <div className="mt-8">
            <FormWhatsApp
              id="anunciar"
              interesse="Quer anunciar imóvel"
              cabecalho="Olá! Quero anunciar meu imóvel com a GG Imóveis Litoral."
              botao="Enviar cadastro"
              campos={[
                { nome: "finalidade", rotulo: "Quero", tipo: "select", opcoes: ["Vender", "Alugar", "Vender ou alugar"] },
                { nome: "tipo", rotulo: "Tipo de imóvel", tipo: "select", opcoes: ["Apartamento", "Casa", "Cobertura", "Studio", "Sala comercial", "Terreno"] },
                { nome: "cidade", rotulo: "Cidade", tipo: "select", opcoes: ["Santos", "São Vicente", "Praia Grande", "Guarujá", "Mongaguá", "Itanhaém", "Outra"] },
                { nome: "bairro", rotulo: "Bairro", obrigatorio: true, placeholder: "Ex.: Gonzaga" },
                { nome: "area", rotulo: "Área útil (m²)", tipo: "number", placeholder: "Ex.: 85" },
                { nome: "dormitorios", rotulo: "Dormitórios", tipo: "select", opcoes: ["Nenhum", "1", "2", "3", "4 ou mais"] },
                { nome: "vagas", rotulo: "Vagas de garagem", tipo: "select", opcoes: ["Nenhuma", "1", "2", "3 ou mais"] },
                { nome: "valor", rotulo: "Valor pretendido", placeholder: "Ex.: R$ 650 mil ou R$ 2.500/mês" },
                { nome: "descricao", rotulo: "Conte mais sobre o imóvel", tipo: "textarea", placeholder: "Vista mar, reformado, lazer do condomínio, distância da praia..." },
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
