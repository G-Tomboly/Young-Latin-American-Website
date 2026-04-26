-- ============================================
--  YLA — Young Latin American
--  Schema Supabase
--  Cole este arquivo no SQL Editor do Supabase
-- ============================================

-- ─── TABELA: pesquisas ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pesquisas (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz DEFAULT now(),
  nome           text NOT NULL,
  email          text NOT NULL,
  idade          text NOT NULL,
  pais           text NOT NULL,
  escola         text NOT NULL,
  orientador     text,
  coautores      text,
  titulo         text NOT NULL,
  area           text NOT NULL,
  idioma         text NOT NULL,
  resumo         text NOT NULL,
  keywords       text NOT NULL,
  artigo_texto   text NOT NULL,
  status         text NOT NULL DEFAULT 'pendente'
                   CHECK (status IN ('pendente', 'em_revisao', 'aprovado', 'rejeitado', 'publicado')),
  publicado_em   timestamptz,
  notas_editor   text
);

-- ─── TABELA: contatos ────────────────────────────────────────────────────────
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

CREATE POLICY "pesquisas_leitura_publica"
  ON pesquisas FOR SELECT
  USING (status = 'publicado');

CREATE POLICY "pesquisas_insercao_publica"
  ON pesquisas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "contatos_insercao_publica"
  ON contatos FOR INSERT
  WITH CHECK (true);

-- ─── 1 PESQUISA REAL (Brasil) ────────────────────────────────────────────────

INSERT INTO pesquisas (
  nome, email, idade, pais, escola, orientador,
  titulo, area, idioma, resumo, keywords, artigo_texto,
  status, publicado_em
) VALUES (
  'Ana Beatriz Ferreira',
  'anabeatriz@younglatinamerican.org',
  '17 anos',
  'Brasil',
  'Escola Estadual Professor Antônio Leal',
  'Prof. Dr. Carlos Eduardo Martins',
  'Análise da qualidade da água do Rio Paraíba do Sul no trecho urbano de Taubaté: parâmetros físico-químicos e indicadores de contaminação',
  'Meio Ambiente / Ecologia',
  'Português',
  'Este estudo analisou parâmetros físico-químicos da água do Rio Paraíba do Sul no trecho urbano de Taubaté (SP), com coletas em quatro pontos distintos ao longo de dois meses. Foram avaliados pH, turbidez, oxigênio dissolvido, condutividade elétrica e coliformes totais. Os resultados indicaram variações significativas entre os pontos, com piora dos indicadores nas áreas de maior densidade urbana e despejo de efluentes. O estudo conclui que a qualidade hídrica do trecho analisado está comprometida e propõe diretrizes de monitoramento contínuo como política pública municipal.',
  'Rio Paraíba do Sul, qualidade da água, Taubaté, parâmetros físico-químicos, contaminação hídrica',
  E'Introdução\n\nO Rio Paraíba do Sul é um dos principais corpos hídricos do Estado de São Paulo, abastecendo milhões de pessoas em sua bacia. No trecho que atravessa o município de Taubaté, o rio sofre pressão constante do crescimento urbano e industrial, comprometendo a qualidade de suas águas.\n\nEsta pesquisa foi realizada no âmbito de um projeto de iniciação científica escolar e teve como objetivo avaliar as condições da qualidade da água do rio no trecho urbano de Taubaté, com base em parâmetros físico-químicos e indicadores biológicos de contaminação.\n\nMetodologia\n\nAs coletas foram realizadas em quatro pontos georeferenciados ao longo do trecho urbano do Rio Paraíba do Sul, em Taubaté (SP), durante os meses de março e abril de 2025. As amostras foram coletadas em frascos esterilizados e analisadas no laboratório da escola e em parceria com o laboratório da Universidade de Taubaté (UNITAU).\n\nOs parâmetros avaliados foram: pH, turbidez (NTU), oxigênio dissolvido (mg/L), condutividade elétrica (μS/cm) e coliformes totais e termotolerantes (NMP/100mL), conforme Standard Methods for the Examination of Water and Wastewater (APHA, 2017).\n\nResultados e Discussão\n\nOs resultados demonstraram variações significativas entre os quatro pontos. O ponto 1, a montante da área urbana central, apresentou os melhores indicadores: pH 7,1, turbidez 12 NTU, oxigênio dissolvido 6,8 mg/L e ausência de coliformes termotolerantes.\n\nO ponto 4, a jusante de área industrial, apresentou pH 6,4, turbidez 87 NTU, oxigênio dissolvido 3,1 mg/L e 1.800 NMP/100mL de coliformes termotolerantes — extrapolando os limites da Resolução CONAMA nº 357/2005 para rios Classe 2.\n\nConclusão\n\nA qualidade da água do Rio Paraíba do Sul no trecho urbano de Taubaté está comprometida, especialmente nos pontos com maior interferência antrópica. Este estudo reforça a necessidade de monitoramento contínuo e fortalecimento da fiscalização do lançamento de efluentes.\n\nReferências\n\nAPHA. Standard Methods for the Examination of Water and Wastewater. 23. ed. Washington: American Public Health Association, 2017.\n\nBRASIL. Resolução CONAMA nº 357, de 17 de março de 2005. Brasília: MMA, 2005.\n\nANA. Relatório de Conjuntura dos Recursos Hídricos no Brasil. Brasília: ANA, 2023.',
  'publicado',
  '2025-04-10 14:00:00+00'
);

-- ─── IMAGEM DE PESQUISA ───────────────────────────────────────────────────────
-- Adiciona coluna de URL da imagem (opcional) na tabela pesquisas
ALTER TABLE pesquisas ADD COLUMN IF NOT EXISTS imagem_url text;

-- ─── STORAGE: bucket público para imagens das pesquisas ──────────────────────
-- Execute os comandos abaixo no SQL Editor do Supabase:

-- 1. Cria o bucket (somente se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pesquisa-imagens',
  'pesquisa-imagens',
  true,
  5242880,                              -- 5 MB em bytes
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: qualquer pessoa pode fazer upload (INSERT)
CREATE POLICY "pesquisa_imagens_upload_publico"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pesquisa-imagens');

-- 3. Política: qualquer pessoa pode ler as imagens (SELECT)
CREATE POLICY "pesquisa_imagens_leitura_publica"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pesquisa-imagens');
