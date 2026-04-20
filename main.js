// ============================================================
//  YLA — main.js  (versão Supabase — completo e corrigido)
// ============================================================

// ─── Navbar scroll ───────────────────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ─── Hamburger ───────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target))
      navLinks.classList.remove('open');
  });
}

// ─── FAQ accordion ───────────────────────────────────────────
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ─── Smooth scroll ───────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ─── Fade-in via IntersectionObserver ────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.article-card, .category-card, .acao-card, .value-card, .publist-card, .acao-full-card, .faq-item'
).forEach(el => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(20px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease, box-shadow .22s ease, border-color .22s ease';
  observer.observe(el);
});

// ─── Diretrizes nav active state ─────────────────────────────
const dirLinks = document.querySelectorAll('.dir-nav-link');
if (dirLinks.length) {
  const dirSections = document.querySelectorAll('.dir-section');
  const dirObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        dirLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
    });
  }, { threshold: 0.4 });
  dirSections.forEach(s => dirObserver.observe(s));
}

// ─── Utilitários ─────────────────────────────────────────────
const AREA_CORES = {
  'Biologia':         { bg: 'linear-gradient(135deg, #14532d, #22c55e)', cor: '#f97316' },
  'Química':          { bg: 'linear-gradient(135deg, #4a1d96, #7c3aed)', cor: '#ec4899' },
  'Física':           { bg: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', cor: '#0ea5e9' },
  'Meio Ambiente':    { bg: 'linear-gradient(135deg, #1a3a6e, #0ea5e9)', cor: '#f97316' },
  'Tecnologia':       { bg: 'linear-gradient(135deg, #134e4a, #14b8a6)', cor: '#8b5cf6' },
  'Saúde':            { bg: 'linear-gradient(135deg, #7c2d12, #f97316)', cor: '#22c55e' },
  'Matemática':       { bg: 'linear-gradient(135deg, #1e3a5f, #6366f1)', cor: '#60a5fa' },
  'Ciências Sociais': { bg: 'linear-gradient(135deg, #831843, #ec4899)', cor: '#f97316' },
};

function getCores(area) {
  if (!area) return { bg: 'linear-gradient(135deg, #1a3a6e, #3b82f6)', cor: '#f97316' };
  for (const [key, val] of Object.entries(AREA_CORES)) {
    if (area.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return { bg: 'linear-gradient(135deg, #1a3a6e, #3b82f6)', cor: '#f97316' };
}

function getInitials(nome) {
  if (!nome) return '?';
  return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

function formatarData(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function normalizarArea(area) {
  return area ? area.split('/')[0].trim().toLowerCase() : '';
}

// ─── HOME — carrega os 4 artigos mais recentes ────────────────
const articlesGrid = document.getElementById('articlesGrid');
if (articlesGrid && window.YLA) {
  (async () => {
    const artigos  = await window.YLA.listarPesquisas({ ordem: 'recentes' });
    const recentes = artigos.slice(0, 4);

    if (recentes.length === 0) {
      articlesGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
          <div style="font-size:48px;margin-bottom:16px;">🔬</div>
          <h3 style="font-family:var(--font-display);font-size:20px;font-weight:700;color:var(--gray-700);margin-bottom:8px;">Nenhuma publicação ainda</h3>
          <p style="color:var(--gray-400);font-size:15px;margin-bottom:24px;">As primeiras pesquisas aprovadas aparecerão aqui.</p>
          <a href="enviar.html" class="btn-primary" style="display:inline-block;">Seja o primeiro a publicar →</a>
        </div>`;
      return;
    }

    articlesGrid.innerHTML = recentes.map((p, i) => {
      const cores    = getCores(p.area);
      const initials = getInitials(p.nome);
      const featured = i === 0 ? 'article-featured' : '';
      return `
        <article class="article-card ${featured}" style="opacity:0;transform:translateY(20px);transition:opacity .5s ease,transform .5s ease">
          <div class="article-img" style="background:${cores.bg};">
            <div class="article-img-overlay"><span class="article-category">${p.area}</span></div>
          </div>
          <div class="article-body">
            <div class="article-meta">
              <span class="article-date">${formatarData(p.publicado_em)}</span>
            </div>
            <h3 class="article-title">${p.titulo}</h3>
            <p class="article-excerpt">${p.resumo}</p>
            <div class="article-footer">
              <div class="article-author">
                <div class="author-avatar" style="background:${cores.cor};">${initials}</div>
                <div>
                  <div class="author-name">${p.nome}</div>
                  <div class="author-school">${p.escola}, ${p.pais}</div>
                </div>
              </div>
              <a href="artigo.html?id=${p.id}" class="article-cta">Ler →</a>
            </div>
          </div>
        </article>`;
    }).join('');

    articlesGrid.querySelectorAll('.article-card').forEach(el => observer.observe(el));
  })();
}

// ─── PUBLICAÇÕES — carrega do Supabase com filtros ────────────
const pubGrid = document.getElementById('pubGrid');
if (pubGrid && window.YLA) {
  const searchInput    = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const orderFilter    = document.getElementById('orderFilter');

  let todosArtigos = [];

  function renderVazio() {
    pubGrid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:80px 20px;">
        <div style="font-size:56px;margin-bottom:20px;">🔬</div>
        <h3 style="font-family:var(--font-display);font-size:24px;font-weight:800;color:var(--gray-800);letter-spacing:-0.5px;margin-bottom:12px;">
          Nenhuma publicação ainda
        </h3>
        <p style="color:var(--gray-400);font-size:16px;max-width:420px;margin:0 auto 28px;line-height:1.6;">
          As primeiras pesquisas aprovadas pela equipe editorial aparecerão aqui. Seja o primeiro a submeter a sua!
        </p>
        <a href="enviar.html" class="btn-primary btn-large">Publicar minha pesquisa →</a>
      </div>`;
  }

  function renderSemResultados() {
    pubGrid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:80px 20px;">
        <div style="font-size:48px;margin-bottom:16px;">🔍</div>
        <h3 style="font-family:var(--font-display);font-size:20px;font-weight:700;color:var(--gray-700);margin-bottom:8px;">
          Nenhuma pesquisa encontrada
        </h3>
        <p style="color:var(--gray-400);font-size:15px;">Tente buscar por outro termo ou área.</p>
      </div>`;
  }

  function renderCards(artigos) {
    if (todosArtigos.length === 0) { renderVazio(); return; }
    if (artigos.length === 0)      { renderSemResultados(); return; }

    pubGrid.innerHTML = artigos.map(p => {
      const cores    = getCores(p.area);
      const initials = getInitials(p.nome);
      const tags     = (p.keywords || '').split(',').slice(0, 3)
        .map(k => `<span class="tag">${k.trim()}</span>`).join('');
      const catNorm  = normalizarArea(p.area);

      return `
        <div class="publist-card" data-category="${catNorm}" style="opacity:0;transform:translateY(20px);transition:opacity .5s ease,transform .5s ease">
          <div class="publist-img" style="background:${cores.bg};">
            <div class="article-img-overlay"><span class="article-category">${p.area}</span></div>
          </div>
          <div class="publist-body">
            <div class="publist-category">${p.area}</div>
            <h3 class="publist-title">${p.titulo}</h3>
            <p class="publist-abstract">${p.resumo}</p>
            <div class="tags-row">${tags}</div>
            <div class="publist-footer">
              <div class="publist-author">
                <div class="author-avatar" style="background:${cores.cor};width:32px;height:32px;font-size:11px;">${initials}</div>
                <div>
                  <div class="author-name">${p.nome}</div>
                  <div class="author-school">${p.pais} · ${formatarData(p.publicado_em)}</div>
                </div>
              </div>
              <a href="artigo.html?id=${p.id}" class="publist-cta">Ler artigo</a>
            </div>
          </div>
        </div>`;
    }).join('');

    pubGrid.querySelectorAll('.publist-card').forEach(el => observer.observe(el));
  }

  function filtrarLocal() {
    const q   = (searchInput?.value || '').toLowerCase();
    const cat = (categoryFilter?.value || '').toLowerCase();
    const filtered = todosArtigos.filter(p => {
      const texto   = `${p.titulo} ${p.resumo} ${p.keywords} ${p.nome}`.toLowerCase();
      const catCard = normalizarArea(p.area);
      return (!q || texto.includes(q)) && (!cat || catCard.includes(cat));
    });
    renderCards(filtered);
  }

  async function carregarPesquisas() {
    pubGrid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:var(--gray-400);">
        <div style="font-size:32px;margin-bottom:12px;">⏳</div>
        <p style="font-size:15px;">Carregando pesquisas...</p>
      </div>`;

    const ordem  = orderFilter?.value === 'antigas' ? 'antigas' : 'recentes';
    todosArtigos = await window.YLA.listarPesquisas({ ordem });

    // Aplica filtro de categoria vindo da URL (?cat=biologia)
    const params = new URLSearchParams(window.location.search);
    const catURL = params.get('cat');
    if (catURL && categoryFilter) {
      const options = Array.from(categoryFilter.options);
      const match   = options.find(o => o.value.toLowerCase().includes(catURL.toLowerCase()));
      if (match) categoryFilter.value = match.value;
    }

    filtrarLocal();
  }

  carregarPesquisas();

  searchInput?.addEventListener('input', filtrarLocal);
  categoryFilter?.addEventListener('change', filtrarLocal);
  orderFilter?.addEventListener('change', carregarPesquisas);
}

// ─── ARTIGO INDIVIDUAL ────────────────────────────────────────
const articleBody = document.getElementById('articleBody');
if (articleBody && window.YLA) {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');

  if (!id) {
    articleBody.innerHTML = `
      <div style="text-align:center;padding:60px 20px;">
        <div style="font-size:48px;margin-bottom:16px;">🔍</div>
        <p style="color:var(--gray-500);">Artigo não encontrado.</p>
        <a href="publicacoes.html" class="btn-primary" style="display:inline-block;margin-top:16px;">Ver todas as publicações</a>
      </div>`;
  } else {
    (async () => {
      const p = await window.YLA.buscarPesquisa(id);

      if (!p) {
        articleBody.innerHTML = `
          <div style="text-align:center;padding:60px 20px;">
            <div style="font-size:48px;margin-bottom:16px;">🔍</div>
            <p style="color:var(--gray-500);">Artigo não encontrado ou ainda não publicado.</p>
            <a href="publicacoes.html" class="btn-primary" style="display:inline-block;margin-top:16px;">Ver todas as publicações</a>
          </div>`;
        return;
      }

      document.title = `${p.titulo} — YLA`;

      const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      set('artTitulo',       p.titulo);
      set('artArea',         p.area);
      set('artData',         formatarData(p.publicado_em));
      set('artPais',         p.pais);
      set('artResumo',       p.resumo);
      set('artNome',         p.nome);
      set('artEscola',       p.escola);
      set('artOrient',       p.orientador || '—');
      set('artIdioma',       p.idioma);
      set('artPaisSidebar',  p.pais);
      set('artAreaSidebar',  p.area);
      set('artDataSidebar',  formatarData(p.publicado_em));

      const avatar = document.getElementById('artAvatar');
      if (avatar) {
        avatar.textContent       = getInitials(p.nome);
        avatar.style.background  = getCores(p.area).cor;
      }

      const elKeywords = document.getElementById('artKeywords');
      if (elKeywords) {
        elKeywords.innerHTML = (p.keywords || '').split(',')
          .map(k => `<span class="tag">${k.trim()}</span>`).join('');
      }

      const paragrafos = p.artigo_texto
        .split(/\n\n+/)
        .map(par => `<p>${par.replace(/\n/g, '<br>')}</p>`)
        .join('\n');
      articleBody.innerHTML = paragrafos;
    })();
  }
}

// ─── FORMULÁRIO DE ENVIO (enviar.html) ───────────────────────
const submitForm = document.getElementById('submitForm');
if (submitForm && window.YLA && document.getElementById('artigo')) {

  function validarForm(form) {
    let valido = true;
    form.querySelectorAll('[required]').forEach(field => {
      const ok = field.type === 'checkbox' ? field.checked : field.value.trim() !== '';
      if (!ok) {
        valido = false;
        field.style.borderColor = '#ef4444';
        field.addEventListener('input',  () => { field.style.borderColor = ''; }, { once: true });
        field.addEventListener('change', () => { field.style.borderColor = ''; }, { once: true });
      }
    });
    return valido;
  }

  submitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarForm(submitForm)) return;

    const btn = submitForm.querySelector('.btn-form-submit');
    btn.textContent = 'Enviando...';
    btn.disabled    = true;

    const result = await window.YLA.enviarPesquisa({
      nome:         submitForm.querySelector('#nome').value.trim(),
      email:        submitForm.querySelector('#email').value.trim(),
      idade:        submitForm.querySelector('#idade').value,
      pais:         submitForm.querySelector('#pais').value,
      escola:       submitForm.querySelector('#escola').value.trim(),
      orientador:   submitForm.querySelector('#orientador').value.trim(),
      coautores:    submitForm.querySelector('#coautores').value.trim(),
      titulo:       submitForm.querySelector('#titulo').value.trim(),
      area:         submitForm.querySelector('#area').value,
      idioma:       submitForm.querySelector('#idioma').value,
      resumo:       submitForm.querySelector('#resumo').value.trim(),
      keywords:     submitForm.querySelector('#keywords').value.trim(),
      artigo_texto: submitForm.querySelector('#artigo').value.trim(),
    });

    if (result.ok) {
      btn.textContent      = '✓ Enviado com sucesso!';
      btn.style.background = '#22c55e';
      submitForm.reset();
      setTimeout(() => {
        btn.textContent      = 'Enviar pesquisa para revisão →';
        btn.style.background = '';
        btn.disabled         = false;
      }, 4000);
    } else {
      btn.textContent      = '✗ Erro ao enviar. Tente novamente.';
      btn.style.background = '#ef4444';
      btn.disabled         = false;
      setTimeout(() => {
        btn.textContent      = 'Enviar pesquisa para revisão →';
        btn.style.background = '';
      }, 3000);
    }
  });
}

// ─── FORMULÁRIO DE CONTATO (contato.html) ────────────────────
const contatoForm = document.getElementById('contatoForm');
if (contatoForm && window.YLA) {
  contatoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = contatoForm.querySelector('[type="submit"]');
    btn.textContent = 'Enviando...';
    btn.disabled    = true;

    const result = await window.YLA.enviarContato({
      nome:     contatoForm.querySelector('#c-nome').value.trim(),
      email:    contatoForm.querySelector('#c-email').value.trim(),
      assunto:  contatoForm.querySelector('#c-assunto').value,
      pais:     contatoForm.querySelector('#c-pais')?.value || '',
      mensagem: contatoForm.querySelector('#c-msg').value.trim(),
    });

    if (result.ok) {
      btn.textContent      = '✓ Mensagem enviada!';
      btn.style.background = '#22c55e';
      contatoForm.reset();
      setTimeout(() => {
        btn.textContent      = 'Enviar mensagem →';
        btn.style.background = '';
        btn.disabled         = false;
      }, 4000);
    } else {
      btn.textContent      = '✗ Erro. Tente novamente.';
      btn.style.background = '#ef4444';
      btn.disabled         = false;
      setTimeout(() => {
        btn.textContent      = 'Enviar mensagem →';
        btn.style.background = '';
      }, 3000);
    }
  });
}
