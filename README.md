# GG Imóveis Litoral

Site da GG Imóveis Litoral: compra, venda e aluguel de imóveis em Santos, São Vicente, Praia Grande, Guarujá, Mongaguá e Itanhaém.

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`)
- Banco Cloudflare D1 (`gg-imoveis`), fotos no R2 (`gg-imoveis-fotos`), login do painel pela Cloudflare Access

## Comandos
```bash
npm install
npm run dev                                   # desenvolvimento em http://localhost:3000
npx wrangler d1 migrations apply gg-imoveis --local   # cria o banco local
npx opennextjs-cloudflare build && npx wrangler dev   # testa como na Cloudflare (porta 8787)
```
Para testar o painel no computador, crie `.dev.vars` com `ACESSO_LOCAL=liberado` (nunca vai para o GitHub).

## Publicação na Cloudflare
Na Cloudflare (Workers Builds): build `npx opennextjs-cloudflare build`, deploy `npx opennextjs-cloudflare deploy`.
Cada push na branch `main` publica o site. Mudanças no banco: `npx wrangler d1 migrations apply gg-imoveis --remote`.

## Onde editar
- `src/lib/site.ts`: WhatsApp, e-mail, CRECI, horário
- `src/data/imoveis.ts`: imóveis e cidades (dados de demonstração)
- `src/lib/chatbot-dados.ts`: respostas do assistente virtual
- `public/fotos/`: fotos (ilustrativas, geradas por IA)

## Painel do corretor
`/painel` lê e grava no D1. É protegido pela Cloudflare Access e o servidor confere o token
(`src/lib/acesso.ts`) antes de qualquer dado privado. Cada nova sessão envia um aviso por e-mail.
Dados reais de proprietários **nunca** devem entrar neste repositório: ficam só no D1.
Os imóveis de exemplo (`migrations/0002_exemplos.sql`) são fictícios.
