import { linkWhatsApp } from "./site";

export const TIPOS_FILMAGEM = ["Terreno ou lote", "Prédio ou condomínio", "Casa pronta", "Obra em andamento", "Outro"];
export const CIDADES_DRONE = ["Santos", "São Vicente", "Praia Grande", "Guarujá", "Cubatão", "Bertioga", "Mongaguá", "Itanhaém", "Peruíbe", "Outra cidade"];

export function linkDrone({ tipo, cidade, bairro }: { tipo?: string; cidade?: string; bairro?: string } = {}) {
  const linhas = [
    "Olá, Gustavo! Vim pelo site da GG Imóveis Litoral e tenho interesse no serviço de filmagem com drone. Gostaria de saber os valores e a disponibilidade de agenda.",
    tipo ? `Tipo de imóvel: ${tipo}` : "",
    cidade ? `Cidade: ${cidade}` : "",
    bairro ? `Bairro: ${bairro}` : "",
  ].filter(Boolean);
  return linkWhatsApp(linhas.join("\n"));
}
