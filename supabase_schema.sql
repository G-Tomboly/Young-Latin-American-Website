-- ============================================
--  YLA — Young Latin American
--  Schema Supabase
--  Cole este arquivo no SQL Editor do Supabase
-- ============================================

-- ─── TABELA: pesquisas ───────────────────────────────────────────────────────
-- Armazena todas as submissões de artigos científicos
CREATE TABLE IF NOT EXISTS pesquisas (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz DEFAULT now(),

  -- Dados do autor
  nome           text NOT NULL,
  email          text NOT NULL,
  idade          text NOT NULL,
  pais           text NOT NULL,
  escola         text NOT NULL,
  orientador     text,
  coautores      text,

  -- Dados da pesquisa
  titulo         text NOT NULL,
  area           text NOT NULL,
  idioma         text NOT NULL,
  resumo         text NOT NULL,
  keywords       text NOT NULL,
  artigo_texto   text NOT NULL,

  -- Controle editorial
  status         text NOT NULL DEFAULT 'pendente'
                   CHECK (status IN ('pendente', 'em_revisao', 'aprovado', 'rejeitado', 'publicado')),
  publicado_em   timestamptz,
  notas_editor   text
);

-- ─── TABELA: contatos ────────────────────────────────────────────────────────
-- Armazena mensagens enviadas pelo formulário de contato
CREATE TABLE IF NOT EXISTS contatos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),

  nome       text NOT NULL,
  email      text NOT NULL,
  assunto    text NOT NULL,
  pais       text,
  mensagem   text NOT NULL,
  lido       boolean DEFAULT false
);

-- ─── ÍNDICES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS pesquisas_status_idx    ON pesquisas (status);
CREATE INDEX IF NOT EXISTS pesquisas_area_idx      ON pesquisas (area);
CREATE INDEX IF NOT EXISTS pesquisas_publicado_idx ON pesquisas (publicado_em DESC);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
ALTER TABLE pesquisas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contatos  ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode LER pesquisas publicadas (acesso aberto)
CREATE POLICY "pesquisas_leitura_publica"
  ON pesquisas FOR SELECT
  USING (status = 'publicado');

-- Qualquer pessoa pode INSERIR uma nova submissão
CREATE POLICY "pesquisas_insercao_publica"
  ON pesquisas FOR INSERT
  WITH CHECK (true);

-- Qualquer pessoa pode INSERIR uma mensagem de contato
CREATE POLICY "contatos_insercao_publica"
  ON contatos FOR INSERT
  WITH CHECK (true);

-- ─── DADOS DE EXEMPLO ────────────────────────────────────────────────────────
-- Remove os exemplos depois de ter artigos reais

INSERT INTO pesquisas (
  nome, email, idade, pais, escola, orientador,
  titulo, area, idioma, resumo, keywords, artigo_texto,
  status, publicado_em
) VALUES
(
  'Juan Carlos Ríos',
  'juan@exemplo.com',
  '17 anos',
  'Colômbia',
  'Colegio Nacional Nicolás Esguerra',
  'Profa. Carmen Ríos',
  'Análise da qualidade da água em rios urbanos: um estudo comparativo em Bogotá',
  'Meio Ambiente / Ecologia',
  'Português',
  'Este trabalho investigou parâmetros físico-químicos em três rios que cortam zonas urbanas de Bogotá, revelando dados alarmantes sobre contaminação por metais pesados e propondo soluções de baixo custo para remediação.',
  'pH, Metais Pesados, Poluição Hídrica, Bogotá',
  'Conteúdo completo do artigo aqui...',
  'publicado',
  '2025-03-28 10:00:00+00'
),
(
  'Lucía Quispe',
  'lucia@exemplo.com',
  '16 anos',
  'Peru',
  'Colegio Andino',
  NULL,
  'Produção de energia solar em zonas andinas de alta altitude',
  'Física',
  'Português',
  'Medições comparativas da irradiância solar em diferentes altitudes nos Andes peruanos demonstram potencial único para energia fotovoltaica em comunidades remotas.',
  'Energia Solar, Andes, Fotovoltaico',
  'Conteúdo completo do artigo aqui...',
  'publicado',
  '2025-03-22 10:00:00+00'
),
(
  'Ana Mello',
  'ana@exemplo.com',
  '15 anos',
  'Brasil',
  'Colégio Estadual Central',
  'Prof. Ricardo Mello',
  'Impacto do uso de telas no sono de adolescentes: pesquisa de campo escolar',
  'Saúde / Medicina',
  'Português',
  'Pesquisa realizada com 200 estudantes investigou a correlação entre tempo de tela e qualidade do sono, com medições objetivas de melatonina e questionários validados.',
  'Sono, Adolescentes, Melatonina',
  'Conteúdo completo do artigo aqui...',
  'publicado',
  '2025-03-15 10:00:00+00'
),
(
  'Miguel González',
  'miguel@exemplo.com',
  '17 anos',
  'Chile',
  'Instituto Nacional de Santiago',
  NULL,
  'Protótipo de sensor IoT de baixo custo para monitoramento de plantações',
  'Tecnologia / Computação',
  'Português',
  'Desenvolvimento de sistema de sensoriamento acessível para pequenos agricultores usando componentes de baixo custo, conectividade LoRa e visualização em app mobile.',
  'IoT, Agricultura, LoRa',
  'Conteúdo completo do artigo aqui...',
  'publicado',
  '2025-03-10 10:00:00+00'
),
(
  'María F. López',
  'maria@exemplo.com',
  '16 anos',
  'Chile',
  'Colegio San Pedro',
  'Profa. Ana González',
  'Efeitos da poluição sonora em abelhas nativas da Mata Atlântica',
  'Biologia',
  'Português',
  'Estudo de campo monitorou comportamento de forrageamento de abelhas nativas em ambientes com diferentes níveis de ruído urbano, usando gravações e análise computacional.',
  'Abelhas, Ruído, Biodiversidade',
  'Conteúdo completo do artigo aqui...',
  'publicado',
  '2025-03-03 10:00:00+00'
),
(
  'Pedro Henrique Silva',
  'pedro@exemplo.com',
  '17 anos',
  'Brasil',
  'Escola Técnica Federal de Manaus',
  'Prof. Carlos Henrique',
  'Extração e caracterização de pigmentos naturais de plantas amazônicas',
  'Química',
  'Português',
  'Investigação de métodos de extração de pigmentos de cinco espécies amazônicas com potencial para uso em tintura têxtil sustentável e redução de corantes sintéticos.',
  'Pigmentos, Amazônia, Sustentabilidade',
  'Conteúdo completo do artigo aqui...',
  'publicado',
  '2025-02-24 10:00:00+00'
);
