// Validação do que chega do painel antes de gravar no banco.
import { cidades, tipos, type Imovel } from "@/data/imoveis";
import { STATUS, type DadosPrivados } from "@/data/privado-demo";
import type { Registro } from "./banco";

const texto = (v: unknown, max = 300) => (typeof v === "string" ? v.slice(0, max) : "");
const numero = (v: unknown, max = 1e10) => (typeof v === "number" && isFinite(v) && v >= 0 ? Math.min(Math.round(v), max) : 0);
const lista = (v: unknown, max = 40, tam = 200) => (Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, max).map((x) => x.slice(0, tam)) : []);
const foto = (s: string) => /^\/(fotos|midia)\/[\w\-./]+$/.test(s);

export function validarRegistro(dados: unknown): Registro | string {
  const d = dados as { pub?: Partial<Imovel>; priv?: Partial<DadosPrivados> };
  const p = d?.pub, q = d?.priv;
  if (!p || !q) return "Dados incompletos.";
  const ref = texto(p.ref, 20);
  if (!/^GG-\d{4,6}$/.test(ref)) return "Referência inválida.";
  if (!texto(p.titulo).trim() || !texto(p.bairro).trim() || !numero(p.preco)) return "Preencha pelo menos título, bairro e preço.";
  if (!cidades.some((c) => c.nome === p.cidade)) return "Cidade inválida.";
  if (!tipos.includes(p.tipo as Imovel["tipo"])) return "Tipo inválido.";
  if (p.finalidade !== "venda" && p.finalidade !== "aluguel") return "Finalidade inválida.";
  if (!STATUS.includes(q.status as DadosPrivados["status"])) return "Status inválido.";
  if (!texto(q.proprietario).trim() || !texto(q.telefone).trim()) return "Preencha o nome e o telefone do proprietário.";
  const imagens = lista(p.imagens, 30, 300).filter(foto);

  const pub: Imovel = {
    slug: texto(p.slug, 120), ref, titulo: texto(p.titulo, 120).trim(), tipo: p.tipo as Imovel["tipo"], finalidade: p.finalidade,
    cidade: p.cidade as Imovel["cidade"], bairro: texto(p.bairro, 80).trim(), preco: numero(p.preco),
    condominio: numero(p.condominio) || undefined, iptu: numero(p.iptu) || undefined, area: numero(p.area, 100000),
    dormitorios: numero(p.dormitorios, 50), suites: numero(p.suites, 50), banheiros: numero(p.banheiros, 50), vagas: numero(p.vagas, 50),
    distanciaPraia: numero(p.distanciaPraia, 100000), vistaMar: !!p.vistaMar, destaque: !!p.destaque,
    resumo: texto(p.resumo, 300), descricao: lista(p.descricao, 20, 3000), caracteristicas: lista(p.caracteristicas), lazer: lista(p.lazer), imagens,
  };
  const priv: DadosPrivados = {
    status: q.status as DadosPrivados["status"], endereco: texto(q.endereco, 200), complemento: texto(q.complemento, 100), cep: texto(q.cep, 12),
    proprietario: texto(q.proprietario, 120), telefone: texto(q.telefone, 30), email: texto(q.email, 120), chaves: texto(q.chaves, 60),
    chavesObs: texto(q.chavesObs, 200), comissao: texto(q.comissao, 60), exclusividade: !!q.exclusividade,
    exclusividadeAte: /^\d{4}-\d{2}-\d{2}$/.test(texto(q.exclusividadeAte)) ? texto(q.exclusividadeAte) : "",
    captadoEm: /^\d{4}-\d{2}-\d{2}$/.test(texto(q.captadoEm)) ? texto(q.captadoEm) : "", observacoes: texto(q.observacoes, 3000),
  };
  return { pub, priv };
}
