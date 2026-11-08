// Leva clientes e proprietários do banco D1 para as planilhas do Google.
// Usado pela tarefa agendada (o Claude lê a saída e grava nas planilhas pelo conector do Google Sheets).
//   node scripts/planilhas/sincronizar.mjs pendentes          -> JSON com as linhas novas, já na ordem das colunas
//   node scripts/planilhas/sincronizar.mjs marcar <arquivo>   -> marca como enviadas (arquivo = saída de "pendentes")
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const env = { ...process.env, CLOUDFLARE_API_TOKEN: "proxy-injected", CLOUDFLARE_ACCOUNT_ID: "363d95ee221ba1749a593fcbe9239f94" };
const sql = (q) => JSON.parse(execFileSync("npx", ["wrangler", "d1", "execute", "gg-imoveis", "--remote", "--json", "--command", q], { env, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }))[0].results;
const esc = (s) => String(s).replace(/'/g, "''");
// D1 grava em UTC; a planilha mostra no horário de Brasília.
const hora = (utc) => new Date(utc.replace(" ", "T") + "Z").toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }).replace(",", "");

const [cmd, arq] = process.argv.slice(2);
if (cmd === "pendentes") {
  const clientes = sql("SELECT * FROM clientes WHERE sincronizado = 0 ORDER BY id").map((c) => ({
    id: c.id,
    linha: [hora(c.em), c.nome, c.telefone, c.email ?? "", c.interesse, c.ref ?? "", c.imovel ?? "", c.bairro ?? "", c.cidade ?? "",
      c.valor ?? "", c.finalidade ?? "", c.mensagem ?? "", c.pagina ?? "", "Novo", ""],
  }));
  const proprietarios = sql("SELECT ref, dados, atualizado_em FROM proprietarios WHERE sincronizado = 0 ORDER BY atualizado_em").map((p) => {
    const d = JSON.parse(p.dados);
    return {
      ref: p.ref, atualizado_em: p.atualizado_em,
      linha: [hora(p.atualizado_em), d.ref, d.proprietario, d.telefone, d.email, d.endereco, d.complemento, d.cep, d.bairro, d.cidade,
        d.imovel, d.finalidade, d.valor, d.situacao, d.comissao, d.exclusividade, d.captado, d.chaves, d.observacoes].map((v) => v ?? ""),
    };
  });
  console.log(JSON.stringify({ clientes, proprietarios }, null, 1));
} else if (cmd === "marcar" && arq) {
  const { clientes = [], proprietarios = [] } = JSON.parse(readFileSync(arq, "utf8"));
  const ids = clientes.map((c) => Number(c.id)).filter(Number.isInteger);
  if (ids.length) sql(`UPDATE clientes SET sincronizado = 1 WHERE id IN (${ids.join(",")})`);
  // Só marca o proprietário se ele não foi alterado de novo depois da leitura.
  for (const p of proprietarios) sql(`UPDATE proprietarios SET sincronizado = 1 WHERE ref = '${esc(p.ref)}' AND atualizado_em = '${esc(p.atualizado_em)}'`);
  console.log(`Marcados: ${ids.length} cliente(s), ${proprietarios.length} proprietário(s).`);
} else {
  console.log("Uso: sincronizar.mjs pendentes | marcar <arquivo.json>");
  process.exit(1);
}
