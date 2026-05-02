-- ============================================================
-- CRM TRY MEDIA — Script de Base de Dados
-- MySQL 8.0+
-- Executa este ficheiro no teu MySQL antes de arrancar o servidor
-- ============================================================

CREATE DATABASE IF NOT EXISTS crm_try_media
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE crm_try_media;

-- ─────────────────────────────────────────
-- UTILIZADORES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS utilizadores (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nome         VARCHAR(100)  NOT NULL,
  email        VARCHAR(150)  NOT NULL UNIQUE,
  palavra_passe VARCHAR(255) NOT NULL,
  perfil       ENUM('administrador','vendedor') NOT NULL DEFAULT 'vendedor',
  criado_em    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- CLIENTES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nome_empresa    VARCHAR(150) NOT NULL,
  nicho           VARCHAR(100),
  telefone        VARCHAR(20),
  email           VARCHAR(150),
  whatsapp        VARCHAR(20),
  valor_estimado  DECIMAL(12,2) DEFAULT 0,
  status          ENUM('novo','contacto','qualificado','negociacao','progresso','fechado') NOT NULL DEFAULT 'novo',
  prioridade      ENUM('Alto','Médio','Baixo') DEFAULT 'Médio',
  ultimo_contacto DATE,
  fecho_previsto  DATE,
  link_info       VARCHAR(500),
  observacoes     TEXT,
  vendedor_id     INT,
  criado_em       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendedor_id) REFERENCES utilizadores(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- REUNIÕES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reunioes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  titulo      VARCHAR(200) NOT NULL,
  cliente_id  INT,
  data_hora   DATETIME NOT NULL,
  tipo        ENUM('diagnóstico','follow-up','proposta','reunião interna','outro') DEFAULT 'diagnóstico',
  notas       TEXT,
  criado_por  INT,
  criado_em   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id)  REFERENCES clientes(id) ON DELETE SET NULL,
  FOREIGN KEY (criado_por)  REFERENCES utilizadores(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- INTERACÇÕES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interacoes (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id     INT NOT NULL,
  tipo           ENUM('whatsapp','ligação','reunião','email') NOT NULL,
  nota           TEXT,
  utilizador_id  INT,
  data           DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id)    REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- METAS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS metas (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  mes_ano             DATE NOT NULL UNIQUE,
  meta_faturamento    DECIMAL(12,2) DEFAULT 0,
  meta_reunioes       INT DEFAULT 0,
  meta_prospeccoes    INT DEFAULT 0,
  criado_em           DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- DADOS DE EXEMPLO (opcional — apaga se não quiseres)
-- ─────────────────────────────────────────

-- Admin: senha = admin123
INSERT IGNORE INTO utilizadores (nome, email, palavra_passe, perfil) VALUES
('Hélcio Silva', 'helcio@trymedia.ao',
 '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBp3Rb5K2OM3Ri',
 'administrador');

-- Vendedor: senha = vendedor123
INSERT IGNORE INTO utilizadores (nome, email, palavra_passe, perfil) VALUES
('João Manuel', 'joao@trymedia.ao',
 '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uekYg3H.2',
 'vendedor');

-- Clientes de exemplo
INSERT IGNORE INTO clientes (nome_empresa, nicho, telefone, whatsapp, valor_estimado, status, prioridade, ultimo_contacto, vendedor_id) VALUES
('Grupo Alpha',    'Marketing',   '923000001', '923000001', 200000, 'fechado',    'Alto',  '2026-05-12', 1),
('MediaX',         'Audiovisual', '923000002', '923000002', 150000, 'negociacao', 'Médio', '2026-05-10', 2),
('StartupKilamba', 'Tech',        '923000003', '923000003', 500000, 'progresso',  'Alto', '2026-05-03', 1);

-- Meta de Maio 2026
INSERT IGNORE INTO metas (mes_ano, meta_faturamento, meta_reunioes, meta_prospeccoes)
VALUES ('2026-05-01', 2325000, 40, 4);

-- Reunião de exemplo
INSERT IGNORE INTO reunioes (titulo, cliente_id, data_hora, tipo, notas, criado_por) VALUES
('Reunião Grupo Alpha', 1, '2026-05-25 12:00:00', 'diagnóstico', 'Apresentar portfólio.', 1),
('Follow-up MediaX',    2, '2026-05-28 09:30:00', 'follow-up',   'Verificar proposta.',   2);
