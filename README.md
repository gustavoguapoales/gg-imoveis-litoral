# GG Imóveis Litoral

Site da GG Imóveis Litoral: compra, venda e aluguel de imóveis em Santos, São Vicente, Praia Grande, Guarujá, Mongaguá e Itanhaém.

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- Exportação estática (`out/`) publicada na Cloudflare (Workers com arquivos estáticos, `wrangler.jsonc`)

## Comandos
```bash
npm install
npm run dev     # desenvolvimento em http://localhost:3000
npm run build   # gera o site estático em out/
```

## Publicação na Cloudflare
Cloudflare → Workers & Pages → Criar → Importar repositório do GitHub:
- Comando de build: `npm run build`
- Comando de deploy: `npx wrangler deploy`

Cada push na branch `main` publica o site automaticamente.

## Onde editar
- `src/lib/site.ts`: WhatsApp, e-mail, CRECI, horário
- `src/data/imoveis.ts`: imóveis e cidades (dados de demonstração)
- `src/lib/chatbot-dados.ts`: respostas do assistente virtual
- `public/fotos/`: fotos (ilustrativas, geradas por IA)

## Painel do corretor (protótipo)
`/painel` é um protótipo com dados fictícios (`src/data/privado-demo.ts`).
Dados reais de proprietários **nunca** devem entrar neste repositório: na versão final
eles ficam no banco Cloudflare D1, com acesso protegido pela Cloudflare Access.
