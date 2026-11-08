-- Clientes que chegam pelo site (interesse em imóvel, contato, anunciar, avaliação, drone).
-- "sincronizado" = 1 depois de copiado para a planilha "Clientes GG Imóveis".
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  em TEXT NOT NULL DEFAULT (datetime('now')),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  interesse TEXT NOT NULL,
  ref TEXT,
  imovel TEXT,
  bairro TEXT,
  cidade TEXT,
  valor TEXT,
  finalidade TEXT,
  mensagem TEXT,
  pagina TEXT,
  ip TEXT,
  sincronizado INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX clientes_sinc ON clientes(sincronizado);
CREATE INDEX clientes_ip_em ON clientes(ip, em);

-- Proprietários cadastrados no painel (cópia para a planilha "Proprietários GG Imóveis").
-- Uma linha por imóvel; atualizada a cada salvamento.
CREATE TABLE proprietarios (
  ref TEXT PRIMARY KEY,
  dados TEXT NOT NULL,   -- JSON com os campos da planilha
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  sincronizado INTEGER NOT NULL DEFAULT 0
);
