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
  function initYLAGlobe() {
    const canvas = document.getElementById('ylaGlobe');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Canvas interno 960×960, exibido em ~480px via CSS
    const W = 960, H = 960;
    const cx = W / 2, cy = H / 2;
    const R  = W * 0.42;

    let rotY      = 55;   // centrado na América do Sul
    let rotX      = 5;
    let autoSpin  = true;
    let isDragging = false;
    let lastMx = 0, lastMy = 0;
    let animId;

    // Projeção esférica
    function project(lat, lon) {
      const latR = (lat - rotX) * Math.PI / 180;
      const lonR = (lon + rotY) * Math.PI / 180;
      const x = Math.cos(latR) * Math.sin(lonR);
      const y = -Math.sin(latR);
      const z = Math.cos(latR) * Math.cos(lonR);
      return { sx: cx + R * x, sy: cy + R * y, z };
    }

    // ── Continentes ──────────────────────────────────────────
    // fill  = cor de preenchimento
    // line  = cor do contorno
    // w     = espessura do contorno
    // pts   = [[lat, lon], ...]
    const CONTINENTS = [

      // América do Sul (destaque — YLA)
      { id:'SA', fill:'rgba(96,165,250,0.30)', line:'rgba(147,197,253,0.85)', w:1.6,
        pts:[
          [12,-73],[12,-70],[11,-64],[10,-62],[11,-61],[10,-60],[8,-60],
          [7,-57],[6,-54],[4,-53],[2,-52],[0,-51],
          [-2,-44],[-5,-35],[-8,-35],[-10,-37],[-13,-38],
          [-16,-39],[-20,-40],[-22,-43],[-23,-43],
          [-25,-48],[-28,-49],[-30,-51],[-32,-52],
          [-34,-53],[-35,-56],[-38,-57],[-42,-63],
          [-44,-65],[-47,-66],[-50,-68],[-54,-68],
          [-55,-68],[-55,-67],[-54,-64],
          [-56,-67],[-54,-70],[-50,-74],[-46,-74],
          [-42,-73],[-38,-71],[-33,-71],[-28,-71],
          [-23,-70],[-18,-70],[-15,-75],[-12,-77],
          [-8,-79],[-4,-81],[-2,-80],[0,-78],
          [4,-77],[8,-77],[10,-75],[12,-73]
        ]
      },

      // América do Norte (EUA + México + parte)
      { id:'NA', fill:'rgba(96,165,250,0.20)', line:'rgba(147,197,253,0.60)', w:1.2,
        pts:[
          [25,-80],[29,-81],[32,-81],[35,-76],[37,-76],[40,-74],
          [41,-72],[42,-70],[44,-66],[47,-69],[47,-53],
          [46,-60],[45,-73],[44,-76],[43,-79],[42,-83],
          [42,-87],[44,-84],[46,-84],[47,-88],[47,-91],
          [48,-95],[49,-100],[49,-110],[49,-123],
          [48,-124],[40,-124],[37,-122],[34,-120],[32,-117],
          [30,-115],[27,-110],[23,-107],[20,-105],
          [15,-92],[14,-90],[14,-88],[15,-87],[16,-86],
          [21,-87],[22,-97],[25,-97],[28,-97],
          [29,-95],[30,-89],[29,-89],[29,-82],[25,-80]
        ]
      },

      // Canadá
      { id:'CN', fill:'rgba(96,165,250,0.16)', line:'rgba(147,197,253,0.45)', w:1.0,
        pts:[
          [49,-123],[50,-127],[54,-130],[58,-137],[60,-140],
          [65,-141],[68,-141],[70,-130],[72,-120],[72,-100],
          [70,-86],[68,-82],[65,-84],[62,-74],[60,-70],
          [58,-65],[55,-60],[52,-56],[50,-56],[47,-53],
          [46,-60],[47,-70],[45,-73],[44,-76],[46,-84],
          [48,-95],[49,-100],[49,-123]
        ]
      },

      // Groenlândia
      { id:'GL', fill:'rgba(200,220,255,0.14)', line:'rgba(147,197,253,0.38)', w:0.8,
        pts:[
          [76,-72],[72,-80],[70,-86],[68,-82],[65,-84],[63,-50],
          [65,-40],[70,-24],[72,-22],[74,-18],[76,-22],
          [78,-30],[76,-72]
        ]
      },

      // Europa
      { id:'EU', fill:'rgba(96,165,250,0.22)', line:'rgba(147,197,253,0.65)', w:1.1,
        pts:[
          [36,-5],[38,-9],[43,-9],[44,-1],[44,8],[44,12],
          [42,14],[44,12],[46,13],[47,17],[48,20],
          [46,28],[44,30],[47,24],[50,22],[50,14],
          [54,18],[57,22],[58,26],[60,25],[58,12],
          [57,8],[55,9],[54,8],[52,5],[51,3],[50,2],
          [49,2],[48,-2],[46,-1],[43,-2],[43,-9],[36,-5]
        ]
      },

      // Escandinávia
      { id:'SC', fill:'rgba(96,165,250,0.18)', line:'rgba(147,197,253,0.52)', w:0.9,
        pts:[
          [57,8],[58,8],[59,5],[60,5],[62,5],[64,14],
          [65,14],[67,14],[68,15],[69,18],[70,20],
          [71,25],[70,28],[68,27],[66,24],[65,22],
          [63,18],[60,22],[59,18],[58,12],[57,8]
        ]
      },

      // Rússia
      { id:'RU', fill:'rgba(96,165,250,0.16)', line:'rgba(147,197,253,0.42)', w:1.0,
        pts:[
          [50,30],[52,36],[55,45],[60,60],[64,60],[65,75],
          [67,95],[68,110],[68,130],[65,140],[60,160],
          [55,160],[52,142],[50,130],[50,120],[50,105],
          [50,82],[50,60],[50,50],[50,40],[50,30]
        ]
      },

      // África
      { id:'AF', fill:'rgba(96,165,250,0.22)', line:'rgba(147,197,253,0.65)', w:1.2,
        pts:[
          [37,10],[36,24],[32,25],[30,33],[25,36],[22,37],
          [15,42],[10,44],[2,42],[0,42],[-4,40],
          [-8,38],[-10,38],[-16,36],[-22,36],
          [-26,33],[-34,26],[-34,18],[-28,17],
          [-22,14],[-16,0],[-14,-17],[-6,-12],
          [-4,-10],[-4,-14],[-6,0],[0,4],
          [4,8],[8,2],[10,0],[8,-10],[14,-17],
          [22,14],[22,37],[30,33],[36,24],[37,10]
        ]
      },

      // Ásia (Oriente Médio + Índia + China)
      { id:'AS', fill:'rgba(96,165,250,0.18)', line:'rgba(147,197,253,0.52)', w:1.0,
        pts:[
          [38,36],[36,36],[32,36],[30,42],[28,48],[22,56],
          [22,60],[22,58],[24,54],[26,50],[28,46],
          [30,42],[32,36],[34,36],[36,38],[38,38],
          [38,44],[40,48],[38,50],[36,60],[36,72],
          [30,68],[26,64],[22,68],[20,72],[16,74],
          [12,78],[8,77],[8,80],[10,78],[14,78],
          [18,84],[22,90],[24,90],[26,88],[28,78],
          [30,74],[34,74],[36,72],[38,66],[40,60],
          [42,50],[44,50],[46,52],[48,58],[50,60],
          [50,82],[46,82],[42,78],[38,68],[36,60],
          [38,50],[40,50],[42,50],[44,88],[46,88],
          [44,100],[40,106],[34,108],[30,110],
          [26,116],[22,120],[20,106],[18,102],
          [20,100],[22,98],[24,96],[28,96],
          [30,96],[32,92],[34,88],[36,80],
          [38,80],[40,80],[42,78],[50,82],[50,60],
          [50,50],[50,40],[50,30],[54,30],
          [56,28],[58,26],[60,25],[50,30],[38,36]
        ]
      },

      // Japão
      { id:'JP', fill:'rgba(96,165,250,0.18)', line:'rgba(147,197,253,0.50)', w:0.8,
        pts:[
          [31,130],[33,131],[34,133],[36,136],[38,141],
          [40,141],[42,140],[43,141],[44,145],[42,143],
          [40,140],[38,140],[36,136],[34,133],[31,130]
        ]
      },

      // Austrália
      { id:'AU', fill:'rgba(96,165,250,0.20)', line:'rgba(147,197,253,0.58)', w:1.1,
        pts:[
          [-14,126],[-12,133],[-12,136],[-12,141],
          [-14,144],[-16,145],[-19,147],[-22,150],
          [-25,152],[-28,153],[-31,153],[-34,151],
          [-37,150],[-39,147],[-38,141],[-36,139],
          [-34,136],[-32,133],[-31,115],[-22,114],
          [-18,122],[-16,124],[-14,126]
        ]
      },

      // Madagascar
      { id:'MG', fill:'rgba(96,165,250,0.16)', line:'rgba(147,197,253,0.45)', w:0.8,
        pts:[
          [-13,49],[-15,50],[-18,44],[-22,44],
          [-24,44],[-25,46],[-24,48],[-21,48],
          [-18,48],[-15,50],[-13,49]
        ]
      },

      // Nova Zelândia (ilha norte)
      { id:'NZ', fill:'rgba(96,165,250,0.15)', line:'rgba(147,197,253,0.42)', w:0.7,
        pts:[
          [-34,172],[-36,174],[-38,176],[-41,175],
          [-40,172],[-36,172],[-34,172]
        ]
      },
    ];

    // ── Marcadores (apenas Brasil por enquanto) ───────────────
    const MARKERS = [
      { lat: -15.8, lon: -47.9, label: 'Brasil' },
    ];

    // ── Desenha um continente (fill + stroke) ────────────────
    function drawContinent(cont) {
      const pts = cont.pts;
      if (!pts || pts.length < 3) return;

      // Projeta todos os pontos
      const projected = pts.map(([lat, lon]) => ({ ...project(lat, lon), lat, lon }));

      // Conta quantos são visíveis
      const visCount = projected.filter(p => p.z > 0).length;
      if (visCount < 2) return;

      // ── Fill ──
      ctx.beginPath();
      let started = false;
      for (const p of projected) {
        if (!started) {
          ctx.moveTo(p.sx, p.sy);
          started = true;
        } else {
          ctx.lineTo(p.sx, p.sy);
        }
      }
      ctx.closePath();
      ctx.fillStyle = cont.fill;
      ctx.fill();

      // ── Stroke (apenas segmentos visíveis) ──
      ctx.strokeStyle = cont.line;
      ctx.lineWidth   = cont.w;
      ctx.lineJoin    = 'round';
      ctx.lineCap     = 'round';

      ctx.beginPath();
      let inPath = false;
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        if (p.z > 0) {
          if (!inPath) { ctx.moveTo(p.sx, p.sy); inPath = true; }
          else ctx.lineTo(p.sx, p.sy);
        } else {
          if (inPath) { ctx.stroke(); ctx.beginPath(); inPath = false; }
        }
      }
      // fecha para o primeiro ponto visível
      if (inPath) {
        const fp = projected.find(p => p.z > 0);
        if (fp) ctx.lineTo(fp.sx, fp.sy);
        ctx.stroke();
      }
    }

    // ── Loop principal ────────────────────────────────────────
    function draw(ts) {
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
      for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath(); let s = false;
        for (let lon = -180; lon <= 180; lon += 2) {
          const p = project(lat, lon);
          if (p.z > 0) { if (!s) { ctx.moveTo(p.sx, p.sy); s = true; } else ctx.lineTo(p.sx, p.sy); } else s = false;
        }
        ctx.stroke();
      }
      for (let lon = -180; lon < 180; lon += 20) {
        ctx.beginPath(); let s = false;
        for (let lat = -90; lat <= 90; lat += 2) {
          const p = project(lat, lon);
          if (p.z > 0) { if (!s) { ctx.moveTo(p.sx, p.sy); s = true; } else ctx.lineTo(p.sx, p.sy); } else s = false;
        }
        ctx.stroke();
      }

      // Continentes
      for (const cont of CONTINENTS) drawContinent(cont);

      // Destaque extra na América do Sul
      const saData = CONTINENTS.find(c => c.id === 'SA');
      if (saData) {
        ctx.save();
        ctx.shadowColor = 'rgba(96,165,250,0.5)';
        ctx.shadowBlur  = 20;
        ctx.strokeStyle = 'rgba(147,197,253,0.95)';
        ctx.lineWidth   = 2.2;
        ctx.lineJoin    = 'round';
        ctx.lineCap     = 'round';
        const projected = saData.pts.map(([lat, lon]) => project(lat, lon));
        ctx.beginPath();
        let inPath = false;
        for (const p of projected) {
          if (p.z > 0) {
            if (!inPath) { ctx.moveTo(p.sx, p.sy); inPath = true; }
            else ctx.lineTo(p.sx, p.sy);
          } else {
            if (inPath) { ctx.stroke(); ctx.beginPath(); inPath = false; }
          }
        }
        if (inPath) ctx.stroke();
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
        const { lat, lon, label } = MARKERS[i];
        const p = project(lat, lon);
        if (p.z < 0.05) continue;

        const vis    = Math.min(1, (p.z - 0.05) / 0.3);
        const phase  = ((t * 0.7 + i * 0.28) % 1);
        const maxRip = R * 0.058;

        // Ripple 1
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, maxRip * phase, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,115,22,${(1 - phase) * 0.5 * vis})`;
        ctx.fill();

        // Ripple 2
        const phase2 = ((t * 0.7 + i * 0.28 + 0.45) % 1);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, maxRip * phase2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,115,22,${(1 - phase2) * 0.3 * vis})`;
        ctx.fill();

        // Halo
        const haloR = R * 0.040;
        const halo  = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, haloR);
        halo.addColorStop(0, `rgba(251,146,60,${0.42 * vis})`);
        halo.addColorStop(1, `rgba(249,115,22,0)`);
        ctx.beginPath(); ctx.arc(p.sx, p.sy, haloR, 0, Math.PI * 2);
        ctx.fillStyle = halo; ctx.fill();

        // Ponto central
        const dotR = R * 0.017;
        const dot  = ctx.createRadialGradient(p.sx - dotR * 0.3, p.sy - dotR * 0.3, 0, p.sx, p.sy, dotR);
        dot.addColorStop(0, `rgba(255,220,170,${vis})`);
        dot.addColorStop(1, `rgba(249,115,22,${vis})`);
        ctx.beginPath(); ctx.arc(p.sx, p.sy, dotR, 0, Math.PI * 2);
        ctx.fillStyle = dot; ctx.fill();

        // Label
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

      if (autoSpin) rotY -= 0.025;
      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    // Drag
    canvas.addEventListener('mousedown', e => {
      isDragging = true; autoSpin = false;
      lastMx = e.clientX; lastMy = e.clientY;
    });
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      rotY -= (e.clientX - lastMx) * 0.35;
      rotX  = Math.max(-60, Math.min(60, rotX + (e.clientY - lastMy) * 0.25));
      lastMx = e.clientX; lastMy = e.clientY;
    });
    window.addEventListener('mouseup', () => {
      if (isDragging) { isDragging = false; setTimeout(() => { autoSpin = true; }, 2500); }
    });

    // Touch
    canvas.addEventListener('touchstart', e => {
      autoSpin = false;
      lastMx = e.touches[0].clientX; lastMy = e.touches[0].clientY;
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      rotY -= (e.touches[0].clientX - lastMx) * 0.35;
      rotX  = Math.max(-60, Math.min(60, rotX + (e.touches[0].clientY - lastMy) * 0.25));
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
