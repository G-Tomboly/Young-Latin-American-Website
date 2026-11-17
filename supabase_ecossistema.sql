-- YLA · Opportunities & Youth Map
-- EXECUTAR UMA ÚNICA VEZ no SQL Editor do projeto Supabase existente.
-- Complementa supabase_schema.sql / supabase_admin_policies.sql, sem apagar pesquisas.

CREATE TABLE IF NOT EXISTS public.oportunidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  titulo text NOT NULL CHECK (char_length(trim(titulo)) BETWEEN 4 AND 160),
  organizacao text NOT NULL CHECK (char_length(trim(organizacao)) BETWEEN 2 AND 120),
  categoria text NOT NULL CHECK (categoria IN (
    'Bolsas e intercâmbios','Liderança e fellowships','Cursos e certificações',
    'Hackathons e competições','Estágios, voluntariado e pesquisa','Editais e financiamento')),
  descricao text NOT NULL CHECK (char_length(trim(descricao)) BETWEEN 30 AND 1200),
  pais text NOT NULL DEFAULT 'América Latina',
  modalidade text NOT NULL CHECK (modalidade IN ('Online','Presencial','Híbrido')),
  prazo_final date,
  link_url text NOT NULL CHECK (link_url ~* '^https?://[^[:space:]]+$'),
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','publicado'))
);
CREATE INDEX IF NOT EXISTS oportunidades_publicadas_idx
  ON public.oportunidades (status,prazo_final);

CREATE TABLE IF NOT EXISTS public.projetos_juvenis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  titulo text NOT NULL CHECK (char_length(trim(titulo)) BETWEEN 3 AND 130),
  descricao text NOT NULL CHECK (char_length(trim(descricao)) BETWEEN 40 AND 1200),
  area text NOT NULL CHECK (area IN (
    'Educação','Meio ambiente','Ciência e tecnologia','Saúde e bem-estar',
    'Cultura e arte','Inclusão e direitos','Empreendedorismo','Outra')),
  cidade text NOT NULL CHECK (char_length(trim(cidade)) BETWEEN 2 AND 90),
  pais text NOT NULL CHECK (char_length(trim(pais)) BETWEEN 2 AND 90),
  equipe text CHECK (equipe IS NULL OR char_length(equipe)<=120),
  link_url text CHECK (link_url IS NULL OR link_url ~* '^https?://[^[:space:]]+$'),
  -- Apenas localização aproximada que a equipe pode registrar na moderação.
  latitude double precision CHECK (latitude BETWEEN -60 AND 34),
  longitude double precision CHECK (longitude BETWEEN -120 AND -32),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','rejeitado'))
);
CREATE INDEX IF NOT EXISTS projetos_juvenis_status_idx
  ON public.projetos_juvenis (status,created_at DESC);

ALTER TABLE public.oportunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos_juvenis ENABLE ROW LEVEL SECURITY;

-- Publicação só após revisão editorial. Pessoas não autenticadas só leem aprovados.
DROP POLICY IF EXISTS "yla_oportunidades_leitura_publica" ON public.oportunidades;
CREATE POLICY "yla_oportunidades_leitura_publica" ON public.oportunidades
  FOR SELECT TO anon USING (status='publicado');
DROP POLICY IF EXISTS "yla_projetos_leitura_publica" ON public.projetos_juvenis;
CREATE POLICY "yla_projetos_leitura_publica" ON public.projetos_juvenis
  FOR SELECT TO anon USING (status='aprovado');

-- Estudantes podem somente enviar novos projetos para moderação.
-- Nunca podem aprovar, publicar ou definir localização exata.
DROP POLICY IF EXISTS "yla_projetos_submissao_publica" ON public.projetos_juvenis;
CREATE POLICY "yla_projetos_submissao_publica" ON public.projetos_juvenis
  FOR INSERT TO anon
  WITH CHECK (status='pendente' AND latitude IS NULL AND longitude IS NULL);

-- Mesmo padrão de autenticação do admin.html existente: conta Supabase Auth.
-- IMPORTANTE: mantenha o cadastro público de usuários desabilitado, ou substitua
-- estas políticas por uma lista de editores autorizados antes de abrir signups.
DROP POLICY IF EXISTS "yla_oportunidades_admin_select" ON public.oportunidades;
CREATE POLICY "yla_oportunidades_admin_select" ON public.oportunidades
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "yla_oportunidades_admin_insert" ON public.oportunidades;
CREATE POLICY "yla_oportunidades_admin_insert" ON public.oportunidades
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "yla_oportunidades_admin_update" ON public.oportunidades;
CREATE POLICY "yla_oportunidades_admin_update" ON public.oportunidades
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "yla_oportunidades_admin_delete" ON public.oportunidades;
CREATE POLICY "yla_oportunidades_admin_delete" ON public.oportunidades
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "yla_projetos_admin_select" ON public.projetos_juvenis;
CREATE POLICY "yla_projetos_admin_select" ON public.projetos_juvenis
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "yla_projetos_admin_update" ON public.projetos_juvenis;
CREATE POLICY "yla_projetos_admin_update" ON public.projetos_juvenis
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "yla_projetos_admin_delete" ON public.projetos_juvenis;
CREATE POLICY "yla_projetos_admin_delete" ON public.projetos_juvenis
  FOR DELETE TO authenticated USING (true);

GRANT SELECT ON public.oportunidades TO anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.oportunidades TO authenticated;
GRANT SELECT,INSERT ON public.projetos_juvenis TO anon;
GRANT SELECT,UPDATE,DELETE ON public.projetos_juvenis TO authenticated;

-- Não há registros de exemplo inventados. Cadastre oportunidades reais no painel admin.
