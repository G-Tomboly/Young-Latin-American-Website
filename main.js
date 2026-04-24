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
  'Quimica':          { bg: 'linear-gradient(135deg, #4a1d96, #7c3aed)', cor: '#ec4899' },
  'Fisica':           { bg: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', cor: '#0ea5e9' },
  'Meio Ambiente':    { bg: 'linear-gradient(135deg, #1a3a6e, #0ea5e9)', cor: '#f97316' },
  'Tecnologia':       { bg: 'linear-gradient(135deg, #134e4a, #14b8a6)', cor: '#8b5cf6' },
  'Saude':            { bg: 'linear-gradient(135deg, #7c2d12, #f97316)', cor: '#22c55e' },
  'Matematica':       { bg: 'linear-gradient(135deg, #1e3a5f, #6366f1)', cor: '#60a5fa' },
  'Ciencias Sociais': { bg: 'linear-gradient(135deg, #831843, #ec4899)', cor: '#f97316' },
};

function getCores(area) {
  if (!area) return { bg: 'linear-gradient(135deg, #1a3a6e, #3b82f6)', cor: '#f97316' };
  const norm = area.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  for (const [key, val] of Object.entries(AREA_CORES)) {
    if (norm.includes(key.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())) return val;
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

// ─── Mapa de bandeiras por país ──────────────────────────────
const PAIS_FLAG = {
  'Brasil': '🇧🇷', 'Argentina': '🇦🇷', 'Chile': '🇨🇱',
  'Colômbia': '🇨🇴', 'Colombia': '🇨🇴', 'México': '🇲🇽', 'Mexico': '🇲🇽',
  'Peru': '🇵🇪', 'Uruguai': '🇺🇾', 'Paraguai': '🇵🇾',
  'Bolívia': '🇧🇴', 'Bolivia': '🇧🇴', 'Equador': '🇪🇨', 'Ecuador': '🇪🇨',
  'Venezuela': '🇻🇪', 'Cuba': '🇨🇺', 'Panamá': '🇵🇦', 'Panama': '🇵🇦',
  'Costa Rica': '🇨🇷', 'Guatemala': '🇬🇹', 'Honduras': '🇭🇳',
  'El Salvador': '🇸🇻', 'Nicarágua': '🇳🇮', 'Nicaragua': '🇳🇮',
  'República Dominicana': '🇩🇴',
};

// ─── Atualiza o painel de países do globo no hero ─────────────
function updateHeroCountries(artigos) {
  const list = document.getElementById('heroCountriesList');
  if (!list) return;
  const paises = [...new Set(artigos.map(a => a.pais).filter(Boolean))];
  if (!paises.length) return;
  list.innerHTML = paises.map(p => {
    const flag = PAIS_FLAG[p] || '🌎';
    return `<span class="hero-country-tag">${flag} ${p}</span>`;
  }).join('');
}

// ─── Hero card float — atualiza com pesquisa mais recente ────────
function updateHeroCardFloat(p) {
  const card1 = document.querySelector('.hcf-top-left');
  if (!card1 || !p) return;
  const tag   = card1.querySelector('.hcf-tag');
  const title = card1.querySelector('.hcf-title');
  const auth  = card1.querySelector('.hcf-author');
  if (tag)   tag.textContent   = p.area  || 'Pesquisa';
  if (title) title.textContent = p.titulo || '';
  if (auth)  auth.textContent  = (p.nome || '') + ' · ' + (p.pais || '');
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
    if (recentes[0]) updateHeroCardFloat(recentes[0]);
    updateHeroCountries(artigos);
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

// ─── GLOBE SECTION ────────────────────────────────────────────
(function () {

  // ── Projeção ortográfica precisa ─────────────────────────────
  // Converte [longitude, latitude] em coordenadas de tela
  // lambda0, phi0 = centro da projeção em radianos
  function makeProjection(W, H, R, lambda0, phi0) {
    return function project(lon, lat) {
      const l = lon * Math.PI / 180;
      const p = lat * Math.PI / 180;
      // dot product para visibilidade
      const cosc = Math.sin(phi0) * Math.sin(p) +
                   Math.cos(phi0) * Math.cos(p) * Math.cos(l - lambda0);
      if (cosc < 0) return null; // ponto no lado de trás
      const x = R * Math.cos(p) * Math.sin(l - lambda0);
      const y = R * (Math.cos(phi0) * Math.sin(p) -
                     Math.sin(phi0) * Math.cos(p) * Math.cos(l - lambda0));
      return { sx: W / 2 + x, sy: H / 2 - y, z: cosc };
    };
  }

  // ── Desenha um anel de grande círculo (graticule) ────────────
  function drawGraticule(ctx, project, step) {
    ctx.beginPath();
    // paralelos
    for (let lat = -80; lat <= 80; lat += step) {
      let started = false;
      for (let lon = -180; lon <= 180; lon += 1) {
        const p = project(lon, lat);
        if (!p) { started = false; continue; }
        if (!started) { ctx.moveTo(p.sx, p.sy); started = true; }
        else ctx.lineTo(p.sx, p.sy);
      }
    }
    // meridianos
    for (let lon = -180; lon < 180; lon += step) {
      let started = false;
      for (let lat = -90; lat <= 90; lat += 1) {
        const p = project(lon, lat);
        if (!p) { started = false; continue; }
        if (!started) { ctx.moveTo(p.sx, p.sy); started = true; }
        else ctx.lineTo(p.sx, p.sy);
      }
    }
    ctx.stroke();
  }

  // ── Desenha um polígono GeoJSON (rings de [lon, lat]) ────────
  function drawPolygon(ctx, project, rings) {
    ctx.beginPath();
    for (const ring of rings) {
      let started = false;
      let prevVisible = false;
      for (let i = 0; i < ring.length; i++) {
        const [lon, lat] = ring[i];
        const p = project(lon, lat);
        if (!p) {
          prevVisible = false;
          continue;
        }
        if (!started || !prevVisible) {
          ctx.moveTo(p.sx, p.sy);
          started = true;
        } else {
          ctx.lineTo(p.sx, p.sy);
        }
        prevVisible = true;
      }
    }
  }

  function initYLAGlobe() {
    const canvas = document.getElementById('ylaGlobe');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const W = 960, H = 960;
    const R  = W * 0.42;

    // Centro: América do Sul
    let lon0 = -55;  // longitude central
    let lat0 =  -8;  // latitude central

    let autoSpin  = true;
    let isDragging = false;
    let lastMx = 0, lastMy = 0;
    let animId;
    let geoData = null; // dados GeoJSON carregados

    // Carrega dados geográficos reais (Natural Earth via CDN)
    async function loadGeoData() {
      try {
        // TopoJSON Natural Earth 110m countries
        const topoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
        const res = await fetch(topoUrl);
        const topo = await res.json();

        // Converte TopoJSON → GeoJSON usando topojson-client via CDN
        // O topojson está disponível via script inline depois
        if (window.topojson) {
          const countries = window.topojson.feature(topo, topo.objects.countries);
          geoData = countries;
        } else {
          // fallback: tenta carregar topojson dinamicamente
          await loadScript('https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js');
          const countries = window.topojson.feature(topo, topo.objects.countries);
          geoData = countries;
        }
      } catch (e) {
        console.warn('Globe: falha ao carregar GeoJSON, usando fallback.', e);
        geoData = null;
      }
    }

    function loadScript(src) {
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload  = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    // IDs numéricos ISO 3166 para países da América Latina (destaque)
    const LATAM_IDS = new Set([
      '032','068','076','152','170','188','192','214','218','222',
      '320','340','484','558','591','600','604','630','740','858','862'
    ]);

    const MARKERS = [
      { lon: -47.9, lat: -15.8, label: 'Brasil' },
    ];

    // ── Loop principal ────────────────────────────────────────
    function draw(ts) {
      const cx = W / 2, cy = H / 2;
      const lambda0 = lon0 * Math.PI / 180;
      const phi0    = lat0 * Math.PI / 180;
      const project = makeProjection(W, H, R, lambda0, phi0);

      ctx.clearRect(0, 0, W, H);

      // Atmosfera
      const atm = ctx.createRadialGradient(cx, cy, R * 0.97, cx, cy, R * 1.12);
      atm.addColorStop(0,   'rgba(37,99,235,0.22)');
      atm.addColorStop(0.5, 'rgba(37,99,235,0.08)');
      atm.addColorStop(1,   'rgba(37,99,235,0)');
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, Math.PI * 2);
      ctx.fillStyle = atm; ctx.fill();

      // Clip na esfera
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();

      // Fundo do globo
      const sg = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.05, cx, cy, R);
      sg.addColorStop(0,   '#1a3a6e');
      sg.addColorStop(0.5, '#0c1e45');
      sg.addColorStop(1,   '#030913');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);

      // Grade lat/lon
      ctx.lineWidth   = 0.4;
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      drawGraticule(ctx, project, 20);

      // Países (GeoJSON real)
      if (geoData) {
        for (const feature of geoData.features) {
          const id  = String(feature.id).padStart(3, '0');
          const isLatam = LATAM_IDS.has(id);
          const geom = feature.geometry;
          if (!geom) continue;

          const polys = geom.type === 'Polygon'
            ? [geom.coordinates]
            : geom.type === 'MultiPolygon'
            ? geom.coordinates
            : [];

          for (const poly of polys) {
            // Fill
            ctx.beginPath();
            drawPolygon(ctx, project, poly);
            ctx.fillStyle = isLatam ? 'rgba(96,165,250,0.32)' : 'rgba(96,165,250,0.14)';
            ctx.fill();

            // Stroke
            ctx.beginPath();
            drawPolygon(ctx, project, poly);
            ctx.strokeStyle = isLatam ? 'rgba(147,197,253,0.80)' : 'rgba(147,197,253,0.35)';
            ctx.lineWidth   = isLatam ? 1.4 : 0.7;
            ctx.lineJoin    = 'round';
            ctx.stroke();
          }
        }

        // Destaque extra América do Sul (glow)
        ctx.save();
        ctx.shadowColor = 'rgba(96,165,250,0.55)';
        ctx.shadowBlur  = 18;
        for (const feature of geoData.features) {
          const id = String(feature.id).padStart(3, '0');
          if (!LATAM_IDS.has(id)) continue;
          const geom = feature.geometry;
          if (!geom) continue;
          const polys = geom.type === 'Polygon'
            ? [geom.coordinates]
            : geom.type === 'MultiPolygon'
            ? geom.coordinates : [];
          for (const poly of polys) {
            ctx.beginPath();
            drawPolygon(ctx, project, poly);
            ctx.strokeStyle = 'rgba(147,197,253,0.95)';
            ctx.lineWidth   = 2.0;
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // Reflexo especular
      const hi = ctx.createRadialGradient(cx - R * 0.52, cy - R * 0.48, 0, cx - R * 0.3, cy - R * 0.3, R * 0.65);
      hi.addColorStop(0, 'rgba(255,255,255,0.06)');
      hi.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hi; ctx.fillRect(0, 0, W, H);

      ctx.restore(); // fim clip

      // Borda da esfera
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(59,130,246,0.45)';
      ctx.lineWidth   = 2.5; ctx.stroke();

      // ── Marcadores ──────────────────────────────────────────
      const t = ts / 1000;

      for (let i = 0; i < MARKERS.length; i++) {
        const { lon, lat, label } = MARKERS[i];
        const p = project(lon, lat);
        if (!p || p.z < 0.05) continue;

        const vis    = Math.min(1, (p.z - 0.05) / 0.3);
        const phase  = ((t * 0.7 + i * 0.28) % 1);
        const maxRip = R * 0.058;

        ctx.beginPath();
        ctx.arc(p.sx, p.sy, maxRip * phase, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,115,22,${(1 - phase) * 0.5 * vis})`;
        ctx.fill();

        const phase2 = ((t * 0.7 + i * 0.28 + 0.45) % 1);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, maxRip * phase2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,115,22,${(1 - phase2) * 0.3 * vis})`;
        ctx.fill();

        const haloR = R * 0.040;
        const halo  = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, haloR);
        halo.addColorStop(0, `rgba(251,146,60,${0.42 * vis})`);
        halo.addColorStop(1, `rgba(249,115,22,0)`);
        ctx.beginPath(); ctx.arc(p.sx, p.sy, haloR, 0, Math.PI * 2);
        ctx.fillStyle = halo; ctx.fill();

        const dotR = R * 0.017;
        const dot  = ctx.createRadialGradient(p.sx - dotR * 0.3, p.sy - dotR * 0.3, 0, p.sx, p.sy, dotR);
        dot.addColorStop(0, `rgba(255,220,170,${vis})`);
        dot.addColorStop(1, `rgba(249,115,22,${vis})`);
        ctx.beginPath(); ctx.arc(p.sx, p.sy, dotR, 0, Math.PI * 2);
        ctx.fillStyle = dot; ctx.fill();

        if (p.z > 0.25) {
          ctx.save();
          ctx.font      = `700 ${Math.round(R * 0.030)}px 'DM Sans', sans-serif`;
          ctx.fillStyle = `rgba(255,255,255,${Math.min(vis * 1.6, 1)})`;
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur  = 8;
          ctx.textAlign   = 'center';
          ctx.fillText(label, p.sx, p.sy - dotR - R * 0.028);
          ctx.restore();
        }
      }

      if (autoSpin) lon0 -= 0.025;
      animId = requestAnimationFrame(draw);
    }

    // Inicia: carrega geo e começa animação
    loadGeoData().then(() => {
      if (animId) cancelAnimationFrame(animId);
      animId = requestAnimationFrame(draw);
    });
    // Começa a renderizar imediatamente (mesmo sem geo, mostra o globo)
    animId = requestAnimationFrame(draw);

    // ── Drag (mouse) ─────────────────────────────────────────
    canvas.addEventListener('mousedown', e => {
      isDragging = true; autoSpin = false;
      lastMx = e.clientX; lastMy = e.clientY;
      canvas.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - lastMx;
      const dy = e.clientY - lastMy;
      // sensibilidade baseada no raio CSS (canvas é 960px mas exibido em ~480px)
      const scale = (canvas.getBoundingClientRect().width / W) * (180 / (Math.PI * R));
      lon0 -= dx / (canvas.getBoundingClientRect().width) * 180;
      lat0  = Math.max(-80, Math.min(80, lat0 + dy / (canvas.getBoundingClientRect().height) * 180));
      lastMx = e.clientX; lastMy = e.clientY;
    });
    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        canvas.style.cursor = 'grab';
        setTimeout(() => { autoSpin = true; }, 2500);
      }
    });
    canvas.style.cursor = 'grab';

    // ── Drag (touch) ─────────────────────────────────────────
    canvas.addEventListener('touchstart', e => {
      autoSpin = false;
      lastMx = e.touches[0].clientX; lastMy = e.touches[0].clientY;
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const dx = e.touches[0].clientX - lastMx;
      const dy = e.touches[0].clientY - lastMy;
      lon0 -= dx / (canvas.getBoundingClientRect().width) * 180;
      lat0  = Math.max(-80, Math.min(80, lat0 + dy / (canvas.getBoundingClientRect().height) * 180));
      lastMx = e.touches[0].clientX; lastMy = e.touches[0].clientY;
    }, { passive: false });
    canvas.addEventListener('touchend', () => {
      setTimeout(() => { autoSpin = true; }, 2500);
    });
  }



  // Contadores animados
  function initGlobeStats() {
    const els = document.querySelectorAll('.globe-stat-number');
    if (!els.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const start  = performance.now();
        const dur    = 2000;
        function tick(now) {
          const p    = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(ease * target);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    els.forEach(el => obs.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initYLAGlobe(); initGlobeStats(); });
  } else {
    initYLAGlobe();
    initGlobeStats();
  }
})();