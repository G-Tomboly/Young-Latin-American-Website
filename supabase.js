// ============================================================
//  YLA — supabase.js
//  Cliente Supabase + funções de banco de dados
//
//  CONFIGURAÇÃO:
//  1. Substitua SUPABASE_URL e SUPABASE_ANON_KEY pelos valores
//     do seu projeto em https://supabase.com/dashboard → Settings → API
// ============================================================

const SUPABASE_URL      = 'https://fpmqhrotxnkxdqxdhwfy.supabase.co';       // ← troque aqui
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwbXFocm90eG5reGRxeGRod2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2Mzg3NTEsImV4cCI6MjA5MjIxNDc1MX0.8xGr3eZBiOmh2nbBJChrRA48yIMdvqD_K2hKP7vA9Kc';                     // ← troque aqui

// ─── Cliente ─────────────────────────────────────────────────────────────────

const { createClient } = supabase;   // vem do CDN carregado no HTML
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── PESQUISAS ────────────────────────────────────────────────────────────────

/**
 * Busca todas as pesquisas publicadas, com filtros opcionais.
 * @param {object} opts
 * @param {string} [opts.area]     – filtra por área do conhecimento
 * @param {string} [opts.query]    – busca textual em título, resumo e keywords
 * @param {string} [opts.ordem]    – 'recentes' | 'antigas'
 * @returns {Promise<Array>}
 */
async function listarPesquisas({ area = '', query = '', ordem = 'recentes' } = {}) {
  let req = db
    .from('pesquisas')
    .select('id, titulo, area, resumo, keywords, nome, pais, escola, publicado_em, idioma')
    .eq('status', 'publicado');

  if (area) {
    req = req.ilike('area', `%${area}%`);
  }

  if (query) {
    req = req.or(
      `titulo.ilike.%${query}%,resumo.ilike.%${query}%,keywords.ilike.%${query}%,nome.ilike.%${query}%`
    );
  }

  req = req.order('publicado_em', { ascending: ordem === 'antigas' });

  const { data, error } = await req;
  if (error) { console.error('listarPesquisas:', error.message); return []; }
  return data ?? [];
}

/**
 * Busca uma pesquisa completa pelo id (UUID).
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function buscarPesquisa(id) {
  const { data, error } = await db
    .from('pesquisas')
    .select('*')
    .eq('id', id)
    .eq('status', 'publicado')
    .single();

  if (error) { console.error('buscarPesquisa:', error.message); return null; }
  return data;
}

/**
 * Envia uma nova submissão de pesquisa.
 * @param {object} payload – campos do formulário de enviar.html
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
async function enviarPesquisa(payload) {
  const { error } = await db.from('pesquisas').insert([{
    nome:          payload.nome,
    email:         payload.email,
    idade:         payload.idade,
    pais:          payload.pais,
    escola:        payload.escola,
    orientador:    payload.orientador  || null,
    coautores:     payload.coautores   || null,
    titulo:        payload.titulo,
    area:          payload.area,
    idioma:        payload.idioma,
    resumo:        payload.resumo,
    keywords:      payload.keywords,
    artigo_texto:  payload.artigo_texto,
    status:        'pendente',
  }]);

  if (error) {
    console.error('enviarPesquisa:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

// ─── CONTATOS ─────────────────────────────────────────────────────────────────

/**
 * Salva uma mensagem enviada pelo formulário de contato.
 * @param {object} payload
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
async function enviarContato(payload) {
  const { error } = await db.from('contatos').insert([{
    nome:     payload.nome,
    email:    payload.email,
    assunto:  payload.assunto,
    pais:     payload.pais     || null,
    mensagem: payload.mensagem,
  }]);

  if (error) {
    console.error('enviarContato:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

// ─── Exporta para uso nos outros scripts ─────────────────────────────────────

window.YLA = {
  db,
  listarPesquisas,
  buscarPesquisa,
  enviarPesquisa,
  enviarContato,
};
