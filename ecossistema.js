// Young Latin American — Opportunities & Youth Map
// Dados reais são lidos do Supabase. Sem registros, a página exibe estado vazio.
(() => {
  'use strict';
  const db = window.YLA?.db;
  const $ = id => document.getElementById(id);
  const escapeHTML = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = value => {
    try { const u = new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : ''; }
    catch { return ''; }
  };
  const normalize = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const today = () => new Date().toLocaleDateString('sv-SE', {timeZone:'America/Sao_Paulo'}); // calendar date YYYY-MM-DD
  const formatDate = date => {
    if (!date) return 'Inscrições contínuas';
    const [y,m,d] = String(date).slice(0,10).split('-');
    return [d,m,y].join('/');
  };
  const empty = (heading, detail) => `<div class="yla-empty"><strong>${heading}</strong>${detail}</div>`;
  const unique = (items, key) => [...new Set(items.map(x => x[key]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  function fillSelect(id, values) {
    const el = $(id); if (!el) return;
    const initial = el.value;
    el.querySelectorAll('option:not([value=""])').forEach(o => o.remove());
    values.forEach(v => { const option=document.createElement('option'); option.value=v;option.textContent=v;el.append(option); });
    el.value = values.includes(initial) ? initial : '';
  }

  // Opportunities: nunca inventar ou anunciar oportunidades abertas não verificadas.
  if ($('opList')) {
    let items=[];
    const render=()=>{
      const q=normalize($('opSearch').value), cat=$('opCategory').value, pais=$('opCountry').value;
      const modo=$('opMode').value, onlyOpen=$('opOnlyOpen').checked, now=today();
      const filtered=items.filter(x=>{
        const open=!x.prazo_final || x.prazo_final>=now;
        return (!onlyOpen || open) && (!cat || x.categoria===cat) && (!pais || x.pais===pais) && (!modo || x.modalidade===modo) &&
          (!q || normalize([x.titulo,x.organizacao,x.descricao,x.pais].join(' ')).includes(q));
      });
      $('opCount').textContent=`${filtered.length} oportunidade${filtered.length===1?'':'s'} encontrada${filtered.length===1?'':'s'}`;
      if (!filtered.length) {
        $('opList').innerHTML=empty(items.length?'Nenhuma oportunidade com esses filtros':'Nenhuma oportunidade publicada no momento',items.length?'Tente remover algum filtro ou desmarcar “Somente inscrições abertas”.':'A equipe está preparando o catálogo. Enquanto isso, você pode sugerir uma oportunidade pelo formulário de contato.');return;
      }
      $('opList').innerHTML=filtered.map(x=>{
        const open=!x.prazo_final || x.prazo_final>=now;
        const href=safeUrl(x.link_url);
        return `<article class="yla-op-card">
          <div class="yla-card-top"><span class="yla-tag">${escapeHTML(x.categoria)}</span><span class="yla-tag ${open?'open':'closed'}">${open?'Inscrições abertas':'Prazo encerrado'}</span></div>
          <h3>${escapeHTML(x.titulo)}</h3><span class="yla-op-org">${escapeHTML(x.organizacao)}</span>
          <p>${escapeHTML(x.descricao)}</p>
          <div class="yla-meta"><span>🌎 ${escapeHTML(x.pais||'América Latina')} · ${escapeHTML(x.modalidade||'A definir')}</span><span>📅 ${x.prazo_final?'Prazo: '+formatDate(x.prazo_final):'Inscrições contínuas (confirme no site oficial)'}</span></div>
          ${href?`<a class="yla-card-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Ver inscrição oficial ↗</a>`:''}
        </article>`;
      }).join('');
    };
    for (const id of ['opSearch','opCategory','opCountry','opMode','opOnlyOpen']) $(id).addEventListener('input',render);
    (async ()=>{
      if (!db){$('opList').innerHTML=empty('Serviço indisponível','Não foi possível acessar as oportunidades agora.');return;}
      const {data,error}=await db.from('oportunidades').select('id,titulo,organizacao,categoria,descricao,pais,modalidade,prazo_final,link_url')
        .eq('status','publicado').order('created_at',{ascending:false});
      if (error){ console.error('Oportunidades:',error); $('opList').innerHTML=empty('Oportunidades não disponíveis','A equipe precisa ativar o catálogo no banco de dados ou verificar a conexão.'); $('opCount').textContent='Indisponível';return; }
      items=data||[];fillSelect('opCountry',unique(items,'pais'));render();
    })();
  }

  if ($('projectForm')) {
    const form=$('projectForm'), feedback=$('projectFeedback'), button=$('projectSubmit');
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data=new FormData(form);
      const link=String(data.get('link_url')||'').trim();
      if (link && !safeUrl(link)){feedback.textContent='Insira um link começando com https:// ou http://';feedback.className='yla-feedback error';return;}
      if (!db){feedback.textContent='Sistema de envio indisponível. Tente novamente depois.';feedback.className='yla-feedback error';return;}
      button.disabled=true;button.textContent='Enviando...';feedback.textContent='';feedback.className='yla-feedback';
      const payload={ titulo:String(data.get('titulo')||'').trim(),area:String(data.get('area')||''),
        descricao:String(data.get('descricao')||'').trim(), cidade:String(data.get('cidade')||'').trim(),
        pais:String(data.get('pais')||''), equipe:String(data.get('equipe')||'').trim()||null,
        link_url:link||null, status:'pendente' };
      try {
        const {error}=await db.from('projetos_juvenis').insert(payload);
        if (error) throw error;
        form.reset();feedback.textContent='Projeto enviado com sucesso! Ele será revisado antes de aparecer no Youth Map.';feedback.className='yla-feedback success';
      }catch(error){console.error('Envio de projeto:',error);feedback.textContent='Não foi possível enviar. Verifique sua conexão ou a configuração do Supabase e tente novamente.';feedback.className='yla-feedback error';}
      finally {button.disabled=false;button.textContent='Enviar projeto para análise →';}
    });
  }

  // Aproximações geográficas de grandes cidades e capitais latino-americanas.
  // Não são coordenadas pessoais: se cidade desconhecida, usa centro geográfico aproximado do país.
  const countryCoords = {
    'argentina':[-34.60,-58.38],'bolivia':[-16.50,-68.15],'brasil':[-15.78,-47.93],
    'chile':[-33.45,-70.66],'colombia':[4.71,-74.07],'costa rica':[9.93,-84.08],
    'cuba':[23.11,-82.36],'equador':[-0.18,-78.47],'el salvador':[13.70,-89.19],
    'guatemala':[14.64,-90.51],'honduras':[14.08,-87.21],'mexico':[19.43,-99.13],
    'nicaragua':[12.13,-86.25],'panama':[8.98,-79.52],'paraguai':[-25.26,-57.58],
    'peru':[-12.05,-77.04],'republica dominicana':[18.48,-69.90],
    'uruguai':[-34.90,-56.16],'venezuela':[10.49,-66.88]
  };
  const cityCoords={
    'brasil|sao paulo':[-23.55,-46.63],'brasil|rio de janeiro':[-22.91,-43.20],
    'brasil|brasilia':[-15.78,-47.93],'brasil|belo horizonte':[-19.92,-43.94],
    'brasil|salvador':[-12.97,-38.51],'brasil|recife':[-8.05,-34.88],
    'brasil|fortaleza':[-3.73,-38.53],'brasil|manaus':[-3.12,-60.02],
    'brasil|belem':[-1.46,-48.50],'brasil|curitiba':[-25.43,-49.27],
    'brasil|porto alegre':[-30.03,-51.23],'brasil|campinas':[-22.91,-47.06],
    'brasil|florianopolis':[-27.59,-48.55],'brasil|goiania':[-16.68,-49.25],
    'brasil|sao luis':[-2.53,-44.30],'brasil|vitoria':[-20.31,-40.34],
    'brasil|joao pessoa':[-7.12,-34.86],'brasil|natal':[-5.79,-35.21],
    'brasil|cuiaba':[-15.60,-56.10],'brasil|campo grande':[-20.47,-54.62],
    'brasil|teresina':[-5.09,-42.80],'brasil|maceio':[-9.65,-35.74],
    'brasil|aracaju':[-10.91,-37.07],'brasil|taubate':[-23.02,-45.56],
    'brasil|parauapebas':[-6.07,-49.90],
    'argentina|buenos aires':[-34.60,-58.38],'argentina|cordoba':[-31.42,-64.18],
    'argentina|rosario':[-32.95,-60.65],'argentina|mendoza':[-32.89,-68.83],
    'chile|santiago':[-33.45,-70.66],'chile|valparaiso':[-33.04,-71.62],
    'chile|concepcion':[-36.83,-73.05],
    'colombia|bogota':[4.71,-74.07],'colombia|medellin':[6.25,-75.56],
    'colombia|cali':[3.45,-76.53],'colombia|barranquilla':[10.97,-74.78],
    'mexico|ciudad de mexico':[19.43,-99.13],'mexico|guadalajara':[20.67,-103.35],
    'mexico|monterrey':[25.69,-100.32],'mexico|puebla':[19.04,-98.20],
    'mexico|merida':[20.97,-89.62],
    'peru|lima':[-12.05,-77.04],'peru|cusco':[-13.53,-71.97],
    'peru|arequipa':[-16.40,-71.53],
    'equador|quito':[-0.18,-78.47],'equador|guayaquil':[-2.17,-79.92],
    'bolivia|la paz':[-16.50,-68.15],'bolivia|santa cruz':[-17.78,-63.18],
    'paraguai|assuncao':[-25.26,-57.58],'uruguai|montevideu':[-34.90,-56.16],
    'costa rica|sao jose':[9.93,-84.08], 'venezuela|caracas':[10.49,-66.88],
    'panama|cidade do panama':[8.98,-79.52],
    'republica dominicana|santo domingo':[18.48,-69.90],
    'guatemala|cidade da guatemala':[14.64,-90.51]
  };
  function coordinates(item){
    if (Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)) && item.latitude!=null && item.longitude!=null) return [Number(item.latitude),Number(item.longitude)];
    const key=normalize(item.pais)+'|'+normalize(item.cidade);
    return cityCoords[key] || countryCoords[normalize(item.pais)] || null;
  }
  function distanceKm([lat1,lng1],[lat2,lng2]) {
    const r=Math.PI/180,dLat=(lat2-lat1)*r,dLng=(lng2-lng1)*r;
    const a=Math.sin(dLat/2)**2+Math.cos(lat1*r)*Math.cos(lat2*r)*Math.sin(dLng/2)**2;
    return 12742*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  }
  if ($('mapResults')){
    let map=null,layer=null,items=[], userPos=null;
    if (window.L){
      map=L.map('ylaProjectMap',{scrollWheelZoom:false}).setView([-14,-62],3);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:17}).addTo(map);
      layer=L.layerGroup().addTo(map);
    } else $('ylaProjectMap').textContent='Não foi possível carregar o mapa. A lista de projetos continua disponível.';
    function render(){
      const q=normalize($('mapSearch').value),pais=$('mapCountry').value,area=$('mapArea').value;
      let filtered=items.filter(x=>(!pais||x.pais===pais)&&(!area||x.area===area)&&
        (!q||normalize([x.titulo,x.descricao,x.cidade,x.pais,x.equipe].join(' ')).includes(q)));
      if (userPos)filtered.sort((a,b)=>(coordinates(a)?distanceKm(userPos,coordinates(a)):Infinity)-(coordinates(b)?distanceKm(userPos,coordinates(b)):Infinity));
      $('mapCount').textContent=`${filtered.length} projeto${filtered.length===1?'':'s'}`;
      $('mapResults').innerHTML=filtered.length?filtered.map((p,i)=>{
        const url=safeUrl(p.link_url),co=coordinates(p);
        return `<article class="yla-project-card">
           <span class="yla-tag">${escapeHTML(p.area)}</span><h4>${escapeHTML(p.titulo)}</h4>
           <small>📍 ${escapeHTML(p.cidade)}, ${escapeHTML(p.pais)}${userPos&&co?' · aprox. '+Math.round(distanceKm(userPos,co))+' km':''}</small>
           <p>${escapeHTML(p.descricao)}</p>
           ${p.equipe?`<small>👥 ${escapeHTML(p.equipe)}</small>`:''}
           <div class="yla-project-links">${co?`<button type="button" data-project="${i}">Ver no mapa</button>`:''}${url?`<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">Conhecer projeto ↗</a>`:''}</div>
        </article>`;
      }).join(''):empty(items.length?'Nenhum projeto encontrado':'Nenhum projeto publicado ainda',items.length?'Tente outra busca ou remova os filtros.':'Se você lidera uma iniciativa, envie-a para avaliação usando o formulário abaixo.');
      if(map&&layer){
        layer.clearLayers();const coords=[];
        filtered.forEach(p=>{
          const point=coordinates(p);if(!point)return;coords.push(point);
          const marker=L.marker(point).addTo(layer).bindPopup(`<strong>${escapeHTML(p.titulo)}</strong><div>${escapeHTML(p.cidade)}, ${escapeHTML(p.pais)}</div><small>Localização aproximada</small>`);
          p._marker=marker;
        });
        if(userPos)L.circleMarker(userPos,{radius:8,color:'#2563eb',fillOpacity:.6}).addTo(layer).bindPopup('Sua localização (não armazenada)');
        if(coords.length)map.fitBounds(coords,{padding:[38,38],maxZoom:7});else map.setView([-14,-62],3);
      }
      $('mapResults').querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>{
        const p=filtered[Number(b.dataset.project)];const point=coordinates(p);
        if(point&&map){map.flyTo(point,Math.max(map.getZoom(),6));p._marker?.openPopup();}
      }));
    }
    for (const id of ['mapSearch','mapCountry','mapArea']) $(id).addEventListener('input',render);
    $('locateBtn').addEventListener('click',()=>{
      const help=$('mapHelp');
      if(!navigator.geolocation){help.textContent='Localização não disponível neste navegador. Use o filtro de país.';return;}
      help.textContent='Solicitando permissão de localização ao navegador...';
      navigator.geolocation.getCurrentPosition(pos=>{
        userPos=[pos.coords.latitude,pos.coords.longitude];
        help.textContent='Projetos ordenados pela distância aproximada a você. Sua localização é usada somente neste navegador e não é enviada ao banco de dados.';
        render();
      },()=>{help.textContent='Não foi possível obter a localização. Você pode continuar usando os filtros de país e área.';},{enableHighAccuracy:false,timeout:12000,maximumAge:300000});
    });
    (async()=>{
      if (!db){$('mapResults').innerHTML=empty('Serviço indisponível','Tente novamente depois.');return;}
      const {data,error}=await db.from('projetos_juvenis').select('id,titulo,descricao,area,cidade,pais,equipe,link_url,latitude,longitude')
        .eq('status','aprovado').order('created_at',{ascending:false});
      if(error){console.error('Youth Map:',error);$('mapCount').textContent='Indisponível';$('mapResults').innerHTML=empty('Projetos indisponíveis','É necessário configurar as novas tabelas no Supabase ou verificar a conexão.');return;}
      items=data||[];fillSelect('mapCountry',unique(items,'pais'));fillSelect('mapArea',unique(items,'area'));render();
    })();
  }
})();
