# GG Imóveis Litoral: memória do projeto

Site e painel do corretor **Gustavo** (gustavo.guapo70@gmail.com), CRECI-SP 323268,
WhatsApp (13) 99777-1730. Atende Santos, São Vicente, Praia Grande, Guarujá, Mongaguá e Itanhaém.

## Como trabalhar com o Gustavo
- Falar **sempre em português**, de forma simples: ele não é técnico.
- Ele quer que **eu faça tudo** (Cloudflare, GitHub, publicação) e só aprove o resultado.
- **Nada pode gerar mensalidade:** manter tudo no plano gratuito e avisar antes de qualquer custo.
- Créditos do Higgsfield são do Gustavo: pedir aprovação antes de gastar.
- Nunca colocar senhas, chaves ou dados de proprietários no código ou no GitHub.

## Onde está cada coisa
- **Site:** https://ggimoveislitoral.com (o www redireciona). Código: github.com/gustavoguapoales/gg-imoveis-litoral.
- **Publicação:** push na branch `main` → Cloudflare Workers Builds
  (build `npx opennextjs-cloudflare build`, deploy `npx opennextjs-cloudflare deploy`). Leva ~2–4 min.
  Da sessão na nuvem **não dá** para rodar `wrangler deploy` (o proxy quebra o upload de arquivos); usar o push.
- **Stack:** Next.js 16 + Tailwind + OpenNext no Cloudflare Workers.
- **Banco D1** `gg-imoveis`: tabela `imoveis` (colunas `publico` e `privado` em JSON, `status`), `fotos`, `acessos`, `tentativas`.
  Status que aparecem no site: `Disponível` e `Reservado` (`src/data/privado-demo.ts` → `NO_SITE`).
  Imóvel novo nasce `Rascunho` até clicar em "Publicar no site".
- **Fotos** enviadas pelo painel: R2 `gg-imoveis-fotos`, servidas em `/midia/...`. Trava de 8 GB.
- **Painel** `/painel`: login por senha (hash em segredo `PAINEL_SENHA_HASH`, sessão `SESSAO_CHAVE`; segredos do Worker),
  bloqueio após 5 erros, aviso por e-mail a cada login (binding `EMAIL`, remetente painel@ggimoveislitoral.com).
- **E-mail:** contato@ggimoveislitoral.com encaminha para o Gmail (Email Routing). SPF, DKIM e DMARC configurados.
- **Google:** `SITE.indexar = false` em `src/lib/site.ts` (noindex) enquanto houver imóveis de exemplo.
- **Planilhas (Google Drive, pasta "GG Imóveis Litoral"):**
  "Clientes GG Imóveis" `1QVdFU7IFNaDK6OwcOaUpagA3KC7iWiqm0mHRckiokZE` (aba `Clientes`, colunas A–O) e
  "Proprietários GG Imóveis" `13tanY-Wfm-LWV1PNmodfOssQ7g4s7zR-ybcctI9RRb0` (aba `Proprietários`, A–S, 1 linha por Ref).
  O site grava no D1 (`clientes` e `proprietarios`, `sincronizado=0`; cliente também gera e-mail na hora);
  para levar às planilhas: rodar `node scripts/planilhas/sincronizar.mjs pendentes` numa sessão, gravar
  pelo conector Google Sheets e depois `... marcar <arquivo>` (falta automação: tarefa agendada sem conector não funciona).
- **Assistente do site:** `src/lib/chatbot.ts` (lógica) e `src/lib/chatbot-dados.ts` (respostas). Sem IA paga.

## Ferramentas desta sessão na nuvem
- Ambiente `gg-imoveis-litoral`: rede liberada para o site, a Cloudflare e a Higgsfield.
- Chave da API da Cloudflare salva no ambiente (o proxy injeta em `api.cloudflare.com`).
  Para usar o wrangler: `CLOUDFLARE_API_TOKEN=proxy-injected CLOUDFLARE_ACCOUNT_ID=363d95ee221ba1749a593fcbe9239f94`.
- `fetch` do Node precisa de `NODE_USE_ENV_PROXY=1`.
- Zona: `3871ff3b7936d14cfff6ce6d2ff4662e` · Trigger de build: `ed02e092-c446-4350-8053-c3349d17a927`.

## Tarefas comuns
- **Ver imóveis:** `npx wrangler d1 execute gg-imoveis --remote --json --command "SELECT ref,status FROM imoveis"`.
- **Divulgação de um imóvel** (post, story, reel, legenda): `NODE_USE_ENV_PROXY=1 node scripts/divulgacao/gerar.mjs GG-0157`
  (saída em `previa/divulgacao/`, fora do git).
- **Testar local:** `npx opennextjs-cloudflare build && npx wrangler dev` (com `.dev.vars` de teste; não versionado).
- Mudanças no banco: nova migração em `migrations/` + `npx wrangler d1 migrations apply gg-imoveis --remote`.

## Situação (atualizar ao final de cada sessão)
- Site e painel reais no ar. Os 15 imóveis são **exemplos fictícios** e as fotos foram geradas por IA. Apagar quando entrarem os reais.
- Pendências: cadastrar imóveis reais; liberar o Google, o Search Console e o Perfil da Empresa;
  trocar a senha do painel, porque ela foi digitada no chat.
- Ideias combinadas: qualificação de clientes antes do WhatsApp, planilhas por cliente (Google Sheets),
  lembretes da faculdade (Google Agenda e Classroom pelo Gmail).
