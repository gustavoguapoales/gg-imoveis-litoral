// Gera migrations/0002_exemplos.sql com os imóveis de demonstração.
// Uso: npx esbuild scripts/gerar-exemplos-sql.ts --bundle --platform=node --tsconfig=tsconfig.json | node
import { writeFileSync } from "node:fs";
import { imoveis } from "@/data/imoveis";
import { privadosDemo } from "@/data/privado-demo";

const q = (v: string) => `'${v.replace(/'/g, "''")}'`;
const linhas = imoveis.map((i, k) => {
  const { status, ...privado } = privadosDemo[i.ref];
  return `INSERT INTO imoveis (ref, slug, status, publico, privado, ordem) VALUES (${q(i.ref)}, ${q(i.slug)}, ${q(status)}, ${q(JSON.stringify(i))}, ${q(JSON.stringify(privado))}, ${k});`;
});
writeFileSync(
  "migrations/0002_exemplos.sql",
  `-- Imóveis de DEMONSTRAÇÃO (dados fictícios). Podem ser apagados pelo painel.\n${linhas.join("\n")}\n`,
);
console.log(`${linhas.length} imóveis de exemplo gravados em migrations/0002_exemplos.sql`);
