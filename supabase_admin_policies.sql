-- ============================================================
--  YLA — Políticas RLS para o Painel Admin
--  Execute este SQL no Supabase SQL Editor
--  (complementa o supabase_schema.sql original)
-- ============================================================

-- ─── PESQUISAS: admin pode ler TODAS (não só publicadas) ─────
-- Usuários autenticados (admins logados via Supabase Auth) veem tudo
CREATE POLICY "pesquisas_admin_leitura"
  ON pesquisas FOR SELECT
  TO authenticated
  USING (true);

-- ─── PESQUISAS: admin pode atualizar status e notas ──────────
CREATE POLICY "pesquisas_admin_update"
  ON pesquisas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── CONTATOS: admin pode ler todas as mensagens ─────────────
CREATE POLICY "contatos_admin_leitura"
  ON contatos FOR SELECT
  TO authenticated
  USING (true);

-- ─── CONTATOS: admin pode marcar como lida ───────────────────
CREATE POLICY "contatos_admin_update"
  ON contatos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── STORAGE: admin pode deletar imagens ─────────────────────
CREATE POLICY "pesquisa_imagens_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'pesquisa-imagens');

-- ============================================================
--  IMPORTANTE: Crie o usuário admin no Supabase Dashboard:
--  Authentication → Users → Add user
--  Email: admin@younglatinamerican.org
--  Password: (defina uma senha segura)
-- ============================================================
