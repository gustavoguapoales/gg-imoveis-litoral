-- Senhas erradas no painel (para bloquear quem tentar adivinhar a senha).
CREATE TABLE tentativas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX tentativas_ip_em ON tentativas(ip, em);
