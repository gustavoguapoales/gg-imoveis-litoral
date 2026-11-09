-- Visitas ao site (anônimas: sem IP, sem nome). Cada linha = uma página vista.
-- visitante = número aleatório guardado no navegador; sessao = número aleatório da visita.
CREATE TABLE visitas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  em TEXT NOT NULL DEFAULT (datetime('now')),
  visitante TEXT NOT NULL,
  sessao TEXT NOT NULL,
  novo INTEGER NOT NULL DEFAULT 0,
  pagina TEXT NOT NULL,
  origem TEXT NOT NULL,
  detalhe TEXT,
  cidade TEXT,
  regiao TEXT,
  pais TEXT,
  dispositivo TEXT
);
CREATE INDEX visitas_em ON visitas(em);
CREATE INDEX visitas_sessao ON visitas(sessao);
-- Liga o cliente à visita, para saber de onde vieram os leads.
ALTER TABLE clientes ADD COLUMN sessao TEXT;
