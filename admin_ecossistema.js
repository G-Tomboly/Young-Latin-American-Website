// YLA — Painel editorial de oportunidades e projetos (Supabase Auth existente)
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const db=window.YLA?.db;
  const escapeHTML=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl=x=>{try{const u=new URL(x);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}};
  const msg=(id,text,error=false)=>{const el=$(id);el.textContent=text;el.style.color=error?'#b91c1c':'#166534';};
  const statusLabel={pendente:'Aguardando revisão',aprovado:'Publicado',rejeitado:'Rejeitado',publicado:'Publicado',rascunho:'Rascunho'};
  let opportunities=[],projects=[],started=false;
  const buttonState=(button,busy)=>{button.disabled=busy;};
  function renderOpportunities(){
    $('tabCountOportunidades').textContent=opportunities.length;
    if (!opportunities.length){$('opAdminList').innerHTML='<div class="ecos-empty">Nenhuma oportunidade cadastrada. Use o formulário acima.</div>';return;}
    $('opAdminList').innerHTML=opportunities.map(x=>`<div class="ecos-admin-card">
      <div class="ecos-admin-head"><h3>${escapeHTML(x.titulo)}</h3><span class="ecos-admin-badge ${x.status==='rascunho'?'is-draft':''}">${statusLabel[x.status]||escapeHTML(x.status)}</span></div>
      <div class="ecos-admin-meta">${escapeHTML(x.organizacao)} · ${escapeHTML(x.categoria)} · ${escapeHTML(x.pais)} · ${escapeHTML(x.modalidade)} · ${x.prazo_final?'Prazo: '+escapeHTML(x.prazo_final):'Inscrições contínuas'}</div>
      <p>${escapeHTML(x.descricao)}</p>
      ${safeUrl(x.link_url)?`<a href="${escapeHTML(safeUrl(x.link_url))}" target="_blank" rel="noopener noreferrer">Abrir link oficial ↗</a>`:''}
      <div class="ecos-admin-buttons"><button type="button" data-op-edit="${escapeHTML(x.id)}" class="is-secondary">✎ Editar</button>
        <button type="button" data-op-toggle="${escapeHTML(x.id)}">${x.status==='publicado'?'Ocultar':'Publicar'}</button>
        <button type="button" data-op-delete="${escapeHTML(x.id)}" class="is-danger">Excluir</button>
      </div></div>`).join('');
    $('opAdminList').querySelectorAll('[data-op-edit]').forEach(btn=>btn.addEventListener('click',()=>editOpportunity(btn.dataset.opEdit)));
    $('opAdminList').querySelectorAll('[data-op-toggle]').forEach(btn=>btn.addEventListener('click',()=>toggleOpportunity(btn.dataset.opToggle,btn)));
    $('opAdminList').querySelectorAll('[data-op-delete]').forEach(btn=>btn.addEventListener('click',()=>deleteOpportunity(btn.dataset.opDelete,btn)));
  }
  async function loadOpportunities(){
    const {data,error}=await db.from('oportunidades').select('*').order('created_at',{ascending:false});
    if(error){$('opAdminList').textContent='Não foi possível carregar oportunidades. Execute supabase_ecossistema.sql no Supabase. Detalhes: '+error.message;return;}
    opportunities=data||[];renderOpportunities();
  }
  function clearEditor(){
    $('opAdminForm').reset();$('opEditId').value='';$('opFormTitle').textContent='Nova oportunidade';$('opPaisAdmin').value='América Latina';msg('opAdminMessage','');
  }
  function editOpportunity(id){
    const x=opportunities.find(o=>o.id===id);if(!x)return;
    $('opEditId').value=x.id;$('opFormTitle').textContent='Editar oportunidade';
    $('opTitle').value=x.titulo;$('opOrg').value=x.organizacao;$('opCatAdmin').value=x.categoria;
    $('opPaisAdmin').value=x.pais;$('opModeAdmin').value=x.modalidade;$('opDeadline').value=x.prazo_final||'';
    $('opDescAdmin').value=x.descricao;$('opURL').value=x.link_url;$('opStatusAdmin').value=x.status;
    $('opAdminForm').scrollIntoView({behavior:'smooth',block:'center'});
  }
  async function toggleOpportunity(id,btn){
    const x=opportunities.find(o=>o.id===id);if(!x)return;
    const next=x.status==='publicado'?'rascunho':'publicado';
    if(next==='publicado'&&!confirm('Você verificou o prazo, a elegibilidade e o link oficial desta oportunidade?'))return;
    buttonState(btn,true);
    const {error}=await db.from('oportunidades').update({status:next}).eq('id',id);
    if(error){alert('Falha ao mudar status: '+error.message);buttonState(btn,false);return;}
    await loadOpportunities();
  }
  async function deleteOpportunity(id,btn){
    if(!confirm('Excluir permanentemente esta oportunidade?'))return;
    buttonState(btn,true);
    const {error}=await db.from('oportunidades').delete().eq('id',id);
    if(error){alert('Falha ao excluir: '+error.message);buttonState(btn,false);return;}
    await loadOpportunities();
  }
  $('opAdminForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;
    const url=safeUrl($('opURL').value);
    if(!url){msg('opAdminMessage','Use uma URL oficial com https:// ou http://.',true);return;}
    const payload={titulo:$('opTitle').value.trim(),organizacao:$('opOrg').value.trim(),
      categoria:$('opCatAdmin').value,descricao:$('opDescAdmin').value.trim(),
      pais:$('opPaisAdmin').value.trim(),modalidade:$('opModeAdmin').value,
      prazo_final:$('opDeadline').value||null,link_url:url,status:$('opStatusAdmin').value};
    if(payload.status==='publicado'&&!confirm('Você verificou a legitimidade, o prazo e o link oficial?'))return;
    const btn=$('opSaveBtn');buttonState(btn,true);msg('opAdminMessage','Salvando...');
    const id=$('opEditId').value;
    const {error}=id?await db.from('oportunidades').update(payload).eq('id',id):await db.from('oportunidades').insert(payload);
    if(error){msg('opAdminMessage','Erro ao salvar: '+error.message,true);buttonState(btn,false);return;}
    clearEditor();msg('opAdminMessage','Oportunidade salva.');buttonState(btn,false);await loadOpportunities();
  });
  $('opCancelEdit')?.addEventListener('click',clearEditor);

  function renderProjects(){
    $('tabCountProjetos').textContent=projects.length;
    if(!projects.length){$('projectAdminList').innerHTML='<div class="ecos-empty">Nenhum projeto recebido ainda.</div>';return;}
    $('projectAdminList').innerHTML=projects.map(p=>{
      const u=safeUrl(p.link_url),lat=p.latitude==null?'':p.latitude,lon=p.longitude==null?'':p.longitude;
      return `<article class="ecos-admin-card" data-project-id="${escapeHTML(p.id)}">
        <div class="ecos-admin-head"><h3>${escapeHTML(p.titulo)}</h3><span class="ecos-admin-badge ${p.status==='pendente'?'is-pending':p.status==='rejeitado'?'is-draft':''}">${statusLabel[p.status]||escapeHTML(p.status)}</span></div>
        <div class="ecos-admin-meta">📍 ${escapeHTML(p.cidade)}, ${escapeHTML(p.pais)} · ${escapeHTML(p.area)} · ${new Date(p.created_at).toLocaleDateString('pt-BR')}</div>
        <p>${escapeHTML(p.descricao)}</p>
        ${p.equipe?`<div class="ecos-admin-meta">Equipe: ${escapeHTML(p.equipe)}</div>`:''}
        ${u?`<a href="${escapeHTML(u)}" rel="noopener noreferrer" target="_blank">Conferir perfil/site do projeto ↗</a>`:''}
        <div class="ecos-coords"><label>Latitude aproximada (opcional)<input type="number" step="any" min="-60" max="34" data-lat="${escapeHTML(p.id)}" value="${escapeHTML(lat)}" placeholder="Centro da cidade"></label>
        <label>Longitude aproximada (opcional)<input type="number" step="any" min="-120" max="-32" data-lon="${escapeHTML(p.id)}" value="${escapeHTML(lon)}" placeholder="Centro da cidade"></label></div>
        <div class="ecos-admin-meta">Sem coordenadas, o mapa usa um ponto aproximado da cidade (quando conhecida) ou do país.</div>
        <div class="ecos-admin-buttons">
          <button type="button" class="is-success" data-project-status="aprovado">✓ Aprovar e publicar</button>
          <button type="button" class="is-secondary" data-project-geocode="1">Encontrar cidade</button>
          <button type="button" class="is-secondary" data-project-coords="1">Salvar localização</button>
          <button type="button" class="is-danger" data-project-status="rejeitado">Rejeitar / retirar</button>
          <button type="button" class="is-danger" data-project-delete="1">Excluir</button>
        </div>
      </article>`;
    }).join('');
    $('projectAdminList').querySelectorAll('[data-project-id]').forEach(card=>{
      const id=card.dataset.projectId;
      card.querySelectorAll('[data-project-status]').forEach(btn=>btn.addEventListener('click',()=>editProject(id,btn.dataset.projectStatus,card,btn)));
      card.querySelectorAll('[data-project-coords]').forEach(btn=>btn.addEventListener('click',()=>editProject(id,null,card,btn)));
      card.querySelectorAll('[data-project-geocode]').forEach(btn=>btn.addEventListener('click',()=>geocodeProject(id,card,btn)));
      card.querySelectorAll('[data-project-delete]').forEach(btn=>btn.addEventListener('click',()=>deleteProject(id,btn)));
    });
  }
  // Consulta manual apenas para localizar centro de cidade, não endereços individuais.
  // Respeitar uso moderado da API pública OSM/Nominatim (uma solicitação por clique).
  async function geocodeProject(id,card,btn){
    const proj=projects.find(p=>p.id===id);if(!proj)return;
    buttonState(btn,true);const before=btn.textContent;btn.textContent='Buscando cidade...';
    try{
      const qs=new URLSearchParams({q:`${proj.cidade}, ${proj.pais}`,format:'json',limit:'1'});
      const res=await fetch('https://nominatim.openstreetmap.org/search?'+qs.toString(),{headers:{'Accept':'application/json'}});
      if(!res.ok)throw new Error('Serviço de geocodificação indisponível');
      const data=await res.json();if(!data.length)throw new Error('Cidade não encontrada. Informe coordenadas aproximadas manualmente.');
      const lat=Number(data[0].lat),lon=Number(data[0].lon);
      if(lat < -60||lat>34||lon < -120||lon>-32)throw new Error('Localização encontrada fora da região permitida.');
      card.querySelector('[data-lat]').value=lat.toFixed(3);
      card.querySelector('[data-lon]').value=lon.toFixed(3);
      alert('Centro aproximado encontrado. Verifique a cidade e clique em “Salvar localização” ou “Aprovar e publicar”. Dados © OpenStreetMap contributors.');
    }catch(e){alert('Não foi possível localizar a cidade: '+e.message);}
    finally{btn.textContent=before;buttonState(btn,false);}
  }
  function parseCoordinates(card){
    const latInput=card.querySelector('[data-lat]'),lonInput=card.querySelector('[data-lon]');
    const a=latInput.value.trim(),b=lonInput.value.trim();
    if(Boolean(a)!==Boolean(b))throw new Error('Preencha latitude e longitude juntas, ou deixe as duas vazias.');
    if(!a)return {latitude:null,longitude:null};
    const lat=Number(a),lon=Number(b);
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat < -60||lat>34||lon < -120||lon>-32)throw new Error('Coordenadas fora do intervalo da América Latina.');
    return {latitude:lat,longitude:lon};
  }
  async function editProject(id,status,card,btn){
    let payload;
    try{payload=parseCoordinates(card);}catch(e){alert(e.message);return;}
    if(status){
      if(status==='aprovado'&&!confirm('Você verificou que o conteúdo e o link podem ser publicados e não expõem dados pessoais?'))return;
      payload.status=status;
    }
    buttonState(btn,true);
    const {error}=await db.from('projetos_juvenis').update(payload).eq('id',id);
    if(error){alert('Erro ao atualizar projeto: '+error.message);buttonState(btn,false);return;}
    await loadProjects();
  }
  async function deleteProject(id,btn){
    if(!confirm('Excluir permanentemente este projeto?'))return;
    buttonState(btn,true);
    const {error}=await db.from('projetos_juvenis').delete().eq('id',id);
    if(error){alert('Erro ao excluir: '+error.message);buttonState(btn,false);return;}
    await loadProjects();
  }
  async function loadProjects(){
    const {data,error}=await db.from('projetos_juvenis').select('*').order('created_at',{ascending:false});
    if(error){$('projectAdminList').textContent='Não foi possível carregar projetos. Execute supabase_ecossistema.sql. Detalhes: '+error.message;return;}
    projects=data||[];renderProjects();
  }
  window.initEcosistemaAdmin=()=>{
    if(started||!db)return;
    started=true;
    loadOpportunities();loadProjects();
  };
  if($('adminBody')?.style.display==='block')window.initEcosistemaAdmin();
})();
