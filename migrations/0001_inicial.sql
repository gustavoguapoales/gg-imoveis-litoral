-- Imóveis: os dados do anúncio (público) e os dados do proprietário (privado) ficam em colunas separadas.
-- O site público lê somente a coluna "publico".
CREATE TABLE imoveis (
  ref TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'Disponível',
  publico TEXT NOT NULL,   -- JSON com os campos do anúncio
  privado TEXT NOT NULL,   -- JSON com endereço, proprietário, chaves, comissão, exclusividade, observações
  ordem INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX imoveis_status ON imoveis(status);

-- Fotos enviadas pelo painel (para controlar o espaço usado no R2).
CREATE TABLE fotos (
  chave TEXT PRIMARY KEY,
  ref TEXT,
  bytes INTEGER NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Acessos ao painel (cada sessão nova gera um aviso por e-mail).
CREATE TABLE acessos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sessao TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  ip TEXT,
  local TEXT,
  aparelho TEXT,
  em TEXT NOT NULL DEFAULT (datetime('now'))
);
