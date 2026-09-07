(function(){
  "use strict";

  const app = document.getElementById('app');
  const hint = document.getElementById('hintKey');
  const panelBgImg = document.querySelector('.panel-bg-img');
  const panelEl = document.querySelector('.panel');

  /* ================= TOGGLE PAINEL (tecla K) ================= */
  function openPanel(){
    app.hidden = false;
    hint.style.display = 'none';
    if (!radialMenu.hidden) closeRadial();
  }
  function closePanel(){
    app.hidden = true;
    hint.style.display = '';
  }
  function togglePanel(){
    app.hidden ? openPanel() : closePanel();
  }

  /* ================= MENU RADIAL (tecla E) ================= */
  const radialMenu = document.getElementById('radialMenu');
  const radialHubTitle = document.getElementById('radialHubTitle');
  const radialHubSub = document.getElementById('radialHubSub');
  const RADIAL_DEFAULT_TITLE = 'Ações';
  const RADIAL_DEFAULT_SUB = radialHubSub ? radialHubSub.textContent : '';

  function openRadial(){
    if (!app.hidden) return; // não abre com o menu K aberto
    radialMenu.hidden = false;
  }
  function closeRadial(){
    radialMenu.hidden = true;
    radialHubTitle.textContent = RADIAL_DEFAULT_TITLE;
    radialHubSub.textContent = RADIAL_DEFAULT_SUB;
  }
  function toggleRadial(){
    radialMenu.hidden ? openRadial() : closeRadial();
  }

  document.querySelectorAll('.radial-petal').forEach(petal=>{
    petal.addEventListener('mouseenter', ()=>{
      radialHubTitle.textContent = petal.dataset.label || RADIAL_DEFAULT_TITLE;
      radialHubSub.textContent = petal.dataset.sub || '';
    });
    petal.addEventListener('mouseleave', ()=>{
      radialHubTitle.textContent = RADIAL_DEFAULT_TITLE;
      radialHubSub.textContent = RADIAL_DEFAULT_SUB;
    });
    petal.addEventListener('click', ()=> closeRadial());
  });
  radialMenu.addEventListener('click', (e)=>{
    if (e.target === radialMenu) closeRadial();
  });

  /* ---- runas nórdicas decorativas ao redor de cada botão ---- */
  const FUTHARK = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ'];
  let futharkPick = 0;
  function nextRune(){ return FUTHARK[(futharkPick++) % FUTHARK.length]; }

  document.querySelectorAll('.radial-petal').forEach((petal, petalIndex)=>{
    const ring = document.createElement('div');
    ring.className = 'rune-ring' + (petal.classList.contains('danger') ? ' danger' : '');
    ring.style.left = petal.style.left;
    ring.style.top = petal.style.top;

    const count = 7;
    const radius = 40;
    for (let i = 0; i < count; i++){
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = 45 + radius * Math.cos(angle);
      const y = 45 + radius * Math.sin(angle);
      const span = document.createElement('span');
      span.className = 'rune';
      span.textContent = nextRune();
      span.style.left = x + 'px';
      span.style.top = y + 'px';
      span.style.animationDelay = (petalIndex * 0.3 + i * 0.22) + 's';
      ring.appendChild(span);
    }
    petal.parentNode.insertBefore(ring, petal);
  });

  window.addEventListener('keydown', (e)=>{
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'select' || tag === 'textarea';
    if ((e.key === 'k' || e.key === 'K') && !typing){
      e.preventDefault();
      togglePanel();
    } else if ((e.key === 'e' || e.key === 'E') && !typing){
      e.preventDefault();
      toggleRadial();
    } else if (e.key === 'Escape'){
      if (qtyOverlay && !qtyOverlay.hidden) closeQtyPicker();
      else if (tradeWindow && !tradeWindow.hidden) closeTradeWindow();
      else if (!radialMenu.hidden) closeRadial();
      else if (!app.hidden) closePanel();
    }
  });
  document.getElementById('closeBtn').addEventListener('click', closePanel);

  /* ================= PARALLAX MOUSE (apenas no fundo da própria NUI) ================= */
  let panelTX = 0, panelTY = 0, panelCX = 0, panelCY = 0;

  window.addEventListener('mousemove', (e)=>{
    if (!app.hidden){
      const r = panelEl.getBoundingClientRect();
      const relX = (e.clientX - r.left) / r.width;
      const relY = (e.clientY - r.top) / r.height;
      panelTX = Math.min(1, Math.max(0, relX)) - 0.5;
      panelTY = Math.min(1, Math.max(0, relY)) - 0.5;
    }
  });

  const PANEL_DEPTH = 34; // px de deslocamento do fundo da própria NUI

  function raf(){
    panelCX += (panelTX - panelCX) * 0.08;
    panelCY += (panelTY - panelCY) * 0.08;
    if (panelBgImg){
      panelBgImg.style.transform = `translate3d(${-panelCX*PANEL_DEPTH}px, ${-panelCY*PANEL_DEPTH*0.6}px, 0) scale(1.08)`;
    }
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* ================= TOASTS ================= */
  const toastStack = document.getElementById('toastStack');
  function toast(msg){
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<svg><use href="#i-check"/></svg><span>${msg}</span>`;
    toastStack.appendChild(el);
    setTimeout(()=>{
      el.classList.add('out');
      setTimeout(()=>el.remove(), 200);
    }, 2600);
  }
  document.body.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-toast]');
    if (btn) toast(btn.dataset.toast);
  });

  /* ================= NAV PRINCIPAL ================= */
  const navItems = document.querySelectorAll('.nav-item');
  const panes = document.querySelectorAll('.tab-pane');
  const tabTitle = document.getElementById('tabTitle');
  const titles = {
    personagem:'Personagem', social:'Social', cla:'Clã', faccoes:'Facções',
    jarl:'Painel do Jarl', rei:'Painel do Rei',
    patrimonio:'Patrimônio', estabulo:'Estábulo', conta:'Conta', loja:'Loja', config:'Configurações', chat:'Chat'
  };
  navItems.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      navItems.forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const tab = btn.dataset.tab;
      panes.forEach(p=>p.classList.toggle('is-active', p.dataset.pane === tab));
      tabTitle.textContent = titles[tab] || '';
    });
  });

  /* ================= SUBTABS genéricas ================= */
  function wireSubtabs(selector, dataAttr, paneSelector, paneAttr){
    document.querySelectorAll(selector).forEach(group=>{});
  }
  function setupSubtabGroup(buttons, panesEls, dataKey, paneKey){
    buttons.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        buttons.forEach(b=>b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const val = btn.dataset[dataKey];
        panesEls.forEach(p=> p.classList.toggle('is-active', p.dataset[paneKey] === val));
      });
    });
  }
  // Personagem
  setupSubtabGroup(
    Array.from(document.querySelectorAll('[data-pane="personagem"] .subtab')),
    Array.from(document.querySelectorAll('[data-pane="personagem"] .sub-pane')),
    'sub', 'subpane'
  );
  // Patrimônio
  setupSubtabGroup(
    Array.from(document.querySelectorAll('[data-pane="patrimonio"] .subtab')),
    Array.from(document.querySelectorAll('[data-pane="patrimonio"] .sub-pane2')),
    'sub2', 'sub2pane'
  );
  // Loja
  setupSubtabGroup(
    Array.from(document.querySelectorAll('[data-pane="loja"] .subtab')),
    Array.from(document.querySelectorAll('[data-pane="loja"] .sub-pane3')),
    'sub3', 'sub3pane'
  );

  /* ================= CHAT ================= */
  const chatButtons = Array.from(document.querySelectorAll('[data-pane="chat"] .subtab'));
  const chatGlobal = document.getElementById('chatGlobal');
  const chatPrivadoWrap = document.getElementById('chatPrivadoWrap');
  const chatPrivado = document.getElementById('chatPrivado');
  let activeChat = 'global'; // 'global' | contact id

  chatButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      chatButtons.forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const isGlobal = btn.dataset.sub4 === 'global';
      chatGlobal.hidden = !isGlobal;
      chatPrivadoWrap.hidden = isGlobal;
      activeChat = isGlobal ? 'global' : activeContact;
    });
  });

  /* ---- contatos / conversas privadas ---- */
  const dmContacts = {
    serana: { name:'Serana Noctis', avatar:'S', status:'Online',
      messages:[
        { from:'them', text:'Ei, ainda temos aquele contrato pendente em Riften.', time:'20:12' },
        { from:'me', text:'Verdade, bora resolver amanhã cedo.', time:'20:14' },
      ]},
    ulfric: { name:'Ulfric Stormcaller', avatar:'U', status:'Online',
      messages:[
        { from:'them', text:'Fechado! 20h na entrada de Helgen. Não se atrasem.', time:'21:43' },
      ]},
    gorimir: { name:'Gorimir Ironshield', avatar:'G', status:'Offline',
      messages:[
        { from:'them', text:'Consegui o minério que você pediu.', time:'19:02' },
        { from:'them', text:'Fechei a encomenda de ferro.', time:'19:05' },
      ]},
    lyra: { name:'Lyra Ashbane', avatar:'L', status:'Offline',
      messages:[
        { from:'them', text:'Tenho umas 10 sobrando. Posso levar.', time:'21:46' },
      ]},
  };
  let activeContact = 'serana';

  function renderDm(contactId){
    const c = dmContacts[contactId];
    if (!c) return;
    document.getElementById('dmActiveAvatar').textContent = c.avatar;
    document.getElementById('dmActiveName').textContent = c.name;
    const statusEl = document.getElementById('dmActiveStatus');
    statusEl.textContent = c.status;
    statusEl.classList.toggle('ok', c.status === 'Online');

    chatPrivado.innerHTML = '';
    c.messages.forEach(m=>{
      const row = document.createElement('div');
      row.className = 'msg';
      const who = m.from === 'me' ? 'Você' : c.name;
      const avatar = m.from === 'me' ? 'B' : c.avatar;
      row.innerHTML = `<div class="avatar sm">${avatar}</div><div class="msg-body"><div class="msg-head"><strong>${who}</strong><time>${m.time}</time></div><p></p></div>`;
      row.querySelector('p').textContent = m.text;
      chatPrivado.appendChild(row);
    });
    chatPrivado.scrollTop = chatPrivado.scrollHeight;
  }
  renderDm(activeContact);

  document.querySelectorAll('.contact-item').forEach(item=>{
    item.addEventListener('click', ()=>{
      document.querySelectorAll('.contact-item').forEach(i=>i.classList.remove('is-active'));
      item.classList.add('is-active');
      const badge = item.querySelector('.unread-badge');
      if (badge) badge.remove();
      activeContact = item.dataset.contact;
      activeChat = activeContact;
      renderDm(activeContact);
    });
  });

  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  function sendMessage(){
    const text = chatInput.value.trim();
    if (!text) return;
    const now = new Date();
    const time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');

    if (activeChat === 'global'){
      const row = document.createElement('div');
      row.className = 'msg';
      row.innerHTML = `<div class="avatar sm">B</div><div class="msg-body"><div class="msg-head"><strong>Você</strong><time>${time}</time></div><p></p></div>`;
      row.querySelector('p').textContent = text;
      chatGlobal.appendChild(row);
      chatGlobal.scrollTop = chatGlobal.scrollHeight;
    } else {
      dmContacts[activeChat].messages.push({ from:'me', text, time });
      renderDm(activeChat);
    }
    chatInput.value = '';
  }
  chatSend.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') sendMessage(); });

  /* ================= FACÇÕES: expandir lista de clãs ================= */
  document.querySelectorAll('.expand-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const key = btn.dataset.expand;
      const list = document.querySelector(`.faction-clan-list[data-list="${key}"]`);
      const open = list.classList.toggle('is-open');
      btn.classList.toggle('is-open', open);
    });
  });

  /* ================= GOVERNO: PAINEL DO JARL / PAINEL DO REI ================= */
  const govCandidatePool = [
    'Ulfric Stormcaller', 'Serana Noctis', 'Gorimir Ironshield', 'Eryndor Val', 'Lyra Ashbane',
    'Idgrod, a Anciã', 'Legate Rikke', 'Farkas', 'Njada Stonearm', 'Brelyna Maryon'
  ];

  const govRoles = {
    'jarl-comandante': ['Gorimir Ironshield'],
    'jarl-guarda': ['Eryndor Val', 'Njada Stonearm'],
    'jarl-mago': ['Brelyna Maryon'],
    'jarl-thane': ['Serana Noctis'],
    'rei-comandante': ['Legate Rikke'],
    'rei-guarda': ['Farkas'],
    'rei-mago': ['Idgrod, a Anciã'],
    'rei-thane': ['Ulfric Stormcaller', 'Lyra Ashbane'],
  };

  function renderGovRole(roleKey){
    const container = document.querySelector(`.gov-role[data-role-key="${roleKey}"] .gov-role-members`);
    if (!container) return;
    container.innerHTML = '';
    (govRoles[roleKey] || []).forEach(name=>{
      const chip = document.createElement('span');
      chip.className = 'role-chip';
      chip.innerHTML = `<span></span><button class="role-chip-x" title="Destituir">×</button>`;
      chip.querySelector('span').textContent = name;
      chip.querySelector('.role-chip-x').addEventListener('click', ()=>{
        govRoles[roleKey] = govRoles[roleKey].filter(n=>n !== name);
        renderGovRole(roleKey);
        toast(`${name} foi destituído(a) do cargo.`);
      });
      container.appendChild(chip);
    });
  }
  Object.keys(govRoles).forEach(renderGovRole);

  function fillCandidateSelect(select){
    if (!select) return;
    select.innerHTML = govCandidatePool.map(n=>`<option value="${n}">${n}</option>`).join('');
  }
  fillCandidateSelect(document.getElementById('jarlCandidateSelect'));
  fillCandidateSelect(document.getElementById('reiCandidateSelect'));
  fillCandidateSelect(document.getElementById('provinceCandidateSelect'));

  function bindAppointButton(btnId, candidateSelectId, roleSelectId){
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', ()=>{
      const name = document.getElementById(candidateSelectId).value;
      const roleSelect = document.getElementById(roleSelectId);
      const roleKey = roleSelect.value;
      const roleLabel = roleSelect.options[roleSelect.selectedIndex].textContent;
      if (!govRoles[roleKey].includes(name)){
        govRoles[roleKey].push(name);
      }
      renderGovRole(roleKey);
      toast(`${name} foi nomeado(a) ${roleLabel}.`);
    });
  }
  bindAppointButton('btnNomearJarl', 'jarlCandidateSelect', 'jarlRoleSelect');
  bindAppointButton('btnNomearRei', 'reiCandidateSelect', 'reiRoleSelect');

  /* ---- nomear Jarl de província (Painel do Rei) ---- */
  const provinceSelect = document.getElementById('provinceSelect');
  if (provinceSelect){
    const provinceRows = Array.from(document.querySelectorAll('.province-row'));
    provinceSelect.innerHTML = provinceRows.map(r=>`<option value="${r.dataset.province}">${r.dataset.province}</option>`).join('');

    document.getElementById('btnNomearJarlProvincia').addEventListener('click', ()=>{
      const province = provinceSelect.value;
      const candidate = document.getElementById('provinceCandidateSelect').value;
      const row = provinceRows.find(r=>r.dataset.province === province);
      if (row){
        row.querySelector('.role-chip-static').textContent = candidate;
        toast(`${candidate} foi nomeado(a) Jarl de ${province}.`);
      }
    });
  }

  /* ---- impostos ---- */
  function bindTaxRange(rangeId, valId){
    const range = document.getElementById(rangeId);
    const val = document.getElementById(valId);
    if (!range) return;
    range.addEventListener('input', ()=> val.textContent = range.value + '%');
  }
  bindTaxRange('rangeTaxJarl', 'valTaxJarl');
  bindTaxRange('rangeTaxRei', 'valTaxRei');

  /* ================= CLÃ: WIZARD DE CRIAÇÃO ================= */
  const claCriar = document.getElementById('claCriar');
  const claWizard = document.getElementById('claWizard');
  const claPainel = document.getElementById('claPainel');
  const btnAbrirWizard = document.getElementById('btnAbrirWizard');
  const btnEditarCla = document.getElementById('btnEditarCla');
  const wizCancel = document.getElementById('wizCancel');
  const wizNext = document.getElementById('wizNext');
  const wizPrev = document.getElementById('wizPrev');
  const wsteps = Array.from(document.querySelectorAll('.wstep'));
  const wpanes = Array.from(document.querySelectorAll('.wpane'));
  let currentStep = 1;

  const iconOpts = Array.from(document.querySelectorAll('.icon-opt'));
  const corIcone = document.getElementById('corIcone');
  const corFundo = document.getElementById('corFundo');
  const bannerPreview = document.getElementById('bannerPreview');
  const previewIconSvg = document.getElementById('previewIconSvg');
  let selectedIcon = 'i-shield';

  function updatePreview(){
    bannerPreview.style.setProperty('--cla-bg', corFundo.value);
    bannerPreview.style.setProperty('--cla-fg', corIcone.value);
    previewIconSvg.querySelector('use').setAttribute('href', '#' + selectedIcon);
  }
  iconOpts.forEach(opt=>{
    opt.addEventListener('click', ()=>{
      iconOpts.forEach(o=>o.classList.remove('is-active'));
      opt.classList.add('is-active');
      selectedIcon = opt.dataset.icon;
      updatePreview();
    });
  });
  corIcone.addEventListener('input', updatePreview);
  corFundo.addEventListener('input', updatePreview);
  updatePreview();

  const crownOpts = Array.from(document.querySelectorAll('.crown-opt'));
  let selectedCrown = 'aartiz';
  const crownMeta = {
    aartiz: { label:'Jurado à Coroa Aartiz', icon:'i-crown', cls:'gold' },
    rebola: { label:'Jurado ao Rei que Rebola Lentinho', icon:'i-crown', cls:'purple' },
    neutro: { label:'Clã Independente · Neutro', icon:'i-shield', cls:'gray' },
  };
  crownOpts.forEach(opt=>{
    opt.addEventListener('click', ()=>{
      crownOpts.forEach(o=>o.classList.remove('is-active'));
      opt.classList.add('is-active');
      selectedCrown = opt.dataset.crown;
    });
  });

  function goToStep(n){
    currentStep = n;
    wsteps.forEach(s=> s.classList.toggle('is-active', parseInt(s.dataset.step) === n));
    wpanes.forEach(p=> p.classList.toggle('is-active', parseInt(p.dataset.wpane) === n));
    wizPrev.hidden = n === 1;
    wizNext.textContent = n === 3 ? 'Fundar clã' : 'Avançar';
  }

  btnAbrirWizard.addEventListener('click', ()=>{
    claWizard.hidden = false;
    goToStep(1);
  });
  wizCancel.addEventListener('click', ()=>{ claWizard.hidden = true; });
  wizPrev.addEventListener('click', ()=>{ if(currentStep>1) goToStep(currentStep-1); });
  wizNext.addEventListener('click', ()=>{
    if (currentStep < 3){
      goToStep(currentStep+1);
    } else {
      finalizarClan();
    }
  });

  function finalizarClan(){
    const nome = document.getElementById('claNome').value.trim() || 'Clã Sem Nome';
    const lema = document.getElementById('claLema').value.trim();

    document.getElementById('claNomeDisplay').textContent = nome;
    document.getElementById('claLemaDisplay').textContent = lema ? `"${lema}"` : '';
    document.getElementById('claLemaDisplay').style.display = lema ? '' : 'none';

    const meta = crownMeta[selectedCrown];
    document.getElementById('claCoroaDisplay').textContent = meta.label;

    document.getElementById('claBannerMain').style.setProperty('--cla-bg', corFundo.value);
    document.getElementById('claBannerMain').style.setProperty('--cla-fg', corIcone.value);
    document.getElementById('claBannerIcon').querySelector('use').setAttribute('href', '#' + selectedIcon);

    const seal = document.getElementById('claCrownSeal');
    seal.querySelector('use').setAttribute('href', '#' + meta.icon);
    seal.style.color = meta.cls === 'gold' ? 'var(--gold)' : meta.cls === 'purple' ? 'var(--purple)' : 'var(--gray)';
    seal.style.display = selectedCrown === 'neutro' ? 'none' : 'flex';

    claWizard.hidden = true;
    claCriar.hidden = true;
    claPainel.hidden = false;

    addClanToFaction(selectedCrown, nome, corIcone.value);
    toast(`Clã "${nome}" fundado com sucesso!`);
  }

  btnEditarCla.addEventListener('click', ()=>{
    claWizard.hidden = false;
    goToStep(1);
  });

  const btnDeixarCla = document.getElementById('btnDeixarCla');
  btnDeixarCla.addEventListener('click', ()=>{
    claPainel.hidden = true;
    claCriar.hidden = false;
    toast('Você deixou o clã');
  });

  /* ================= sincroniza clã novo com a aba Facções ================= */
  function addClanToFaction(key, nome, color){
    if (key === 'neutro') key = 'neutro';
    const list = document.querySelector(`.faction-clan-list[data-list="${key}"]`);
    if (!list) return;
    const existing = list.querySelector('.clan-chip.is-you');
    if (existing) existing.remove();
    const chip = document.createElement('div');
    chip.className = 'clan-chip is-you';
    chip.innerHTML = `<span class="chip-dot" style="background:${color}"></span>${nome} (Você)`;
    list.appendChild(chip);
    list.classList.add('is-open');
    const btn = document.querySelector(`.expand-btn[data-expand="${key}"]`);
    if (btn) btn.classList.add('is-open');

    const clanCountEl = document.querySelector(`[data-count="${key}-clans"]`);
    if (clanCountEl && !clanCountEl.dataset.bumped){
      clanCountEl.textContent = (parseInt(clanCountEl.textContent) + 1);
      clanCountEl.dataset.bumped = '1';
    }
  }

  /* ================= CONFIGURAÇÕES ================= */
  const rangeMic = document.getElementById('rangeMic');
  const valMic = document.getElementById('valMic');
  const rangeVoz = document.getElementById('rangeVoz');
  const valVoz = document.getElementById('valVoz');
  rangeMic.addEventListener('input', ()=> valMic.textContent = rangeMic.value + '%');
  rangeVoz.addEventListener('input', ()=> valVoz.textContent = rangeVoz.value + '%');

  const segOpts = Array.from(document.querySelectorAll('.seg-opt'));
  segOpts.forEach(opt=>{
    opt.addEventListener('click', ()=>{
      segOpts.forEach(o=>o.classList.remove('is-active'));
      opt.classList.add('is-active');
    });
  });
  document.getElementById('selEntrada').addEventListener('change', (e)=> toast('Dispositivo de entrada: ' + e.target.value));
  document.getElementById('selSaida').addEventListener('change', (e)=> toast('Dispositivo de saída: ' + e.target.value));

  /* ---- transparência do menu (máx. 80%, nunca invisível) ---- */
  const rangeTransp = document.getElementById('rangeTransp');
  const valTransp = document.getElementById('valTransp');
  rangeTransp.addEventListener('input', ()=>{
    const v = Math.min(80, Math.max(0, parseInt(rangeTransp.value, 10) || 0));
    valTransp.textContent = v + '%';
    panelEl.style.opacity = (1 - v / 100).toFixed(2);
  });

  /* ---- captura de hotkeys (push-to-talk e convocar montaria) ---- */
  function formatKeyLabel(e){
    if (e.key === ' ') return 'ESPAÇO';
    if (e.key.length === 1) return e.key.toUpperCase();
    const map = { ArrowUp:'↑', ArrowDown:'↓', ArrowLeft:'←', ArrowRight:'→', Control:'CTRL', Shift:'SHIFT', Alt:'ALT', Enter:'ENTER', Tab:'TAB' };
    return map[e.key] || e.key.toUpperCase();
  }
  function bindHotkeyCapture(button){
    if (!button) return;
    button.addEventListener('click', ()=>{
      if (button.classList.contains('is-listening')) return;
      const previous = button.textContent;
      button.classList.add('is-listening');
      button.textContent = '...';
      function onKey(e){
        e.preventDefault();
        e.stopPropagation();
        window.removeEventListener('keydown', onKey, true);
        button.classList.remove('is-listening');
        if (e.key === 'Escape'){
          button.textContent = previous;
          return;
        }
        const label = formatKeyLabel(e);
        button.textContent = label;
        button.dataset.current = label;
        toast(`Tecla definida: ${label}`);
      }
      window.addEventListener('keydown', onKey, true);
    });
  }
  bindHotkeyCapture(document.getElementById('hotkeyPtt'));
  bindHotkeyCapture(document.getElementById('hotkeyHorse'));

  /* ================= HUD (sempre visível, independente do painel K) ================= */
  const hudState = { hunger: 72, thirst: 55 };

  function applyHudVital(name, value){
    const clamped = Math.min(100, Math.max(0, value));
    hudState[name] = clamped;
    const fill = document.querySelector(`.hp-bead[data-vital="${name}"] .bead-fill`);
    if (fill) fill.style.height = clamped + '%';
  }
  applyHudVital('hunger', hudState.hunger);
  applyHudVital('thirst', hudState.thirst);

  /* esvazia lentamente com o passar do tempo */
  setInterval(()=>{
    applyHudVital('hunger', hudState.hunger - 0.15);
    applyHudVital('thirst', hudState.thirst - 0.22);
  }, 1000);

  /* botões de teste do HUD (não fazem parte do painel K, ficam na página) */
  const btnHudEat = document.getElementById('btnTestEat');
  const btnHudDrink = document.getElementById('btnTestDrink');
  if (btnHudEat) btnHudEat.addEventListener('click', ()=> applyHudVital('hunger', hudState.hunger + 20));
  if (btnHudDrink) btnHudDrink.addEventListener('click', ()=> applyHudVital('thirst', hudState.thirst + 20));

  /* ---- temperatura: vira sol (quente/vermelho) ou floco de neve (frio/azul) ---- */
  function hexToRgb(hex){
    const n = parseInt(hex.slice(1), 16);
    return [(n>>16)&255, (n>>8)&255, n&255];
  }
  function lerpColor(hexA, hexB, t){
    const a = hexToRgb(hexA), b = hexToRgb(hexB);
    const c = a.map((v,i)=> Math.round(v + (b[i]-v)*t));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }
  const TEMP_NEUTRAL = '#9aa3ad';
  const TEMP_HOT = '#e0483a';
  const TEMP_COLD = '#4fa8d8';

  function applyTemperature(value){
    const clamped = Math.min(50, Math.max(-50, value));
    const intensity = Math.abs(clamped) / 50; // 0 (neutro) a 1 (extremo)
    const isHot = clamped >= 0;
    const icon = isHot ? '#i-sun' : '#i-snowflake';
    const color = lerpColor(TEMP_NEUTRAL, isHot ? TEMP_HOT : TEMP_COLD, intensity);

    document.getElementById('tempIcon').querySelector('use').setAttribute('href', icon);

    const vitalEl = document.querySelector('.hp-bead[data-vital="temperature"]');
    vitalEl.style.setProperty('--vital-color', color);
  }
  applyTemperature(0);

  const sliderTemp = document.getElementById('sliderTemp');
  if (sliderTemp) sliderTemp.addEventListener('input', ()=> applyTemperature(parseFloat(sliderTemp.value)));

  /* ================= BARRAS DE STATUS: combate e regeneração ================= */
  const barState = { health: 86, stamina: 64, magicka: 78 };
  let lastRunAt = 0;

  function setBar(name, value){
    const clamped = Math.min(100, Math.max(0, value));
    barState[name] = clamped;
    const fill = document.querySelector(`.hp-lane.${name} .hp-fill`);
    if (fill) fill.style.width = clamped + '%';
  }

  document.getElementById('btnTestDamage')?.addEventListener('click', ()=> setBar('health', barState.health - 20));
  document.getElementById('btnTestHeal')?.addEventListener('click', ()=> setBar('health', barState.health + 20));
  document.getElementById('btnTestMagic')?.addEventListener('click', ()=> setBar('magicka', barState.magicka - 20));
  document.getElementById('btnTestRun')?.addEventListener('click', ()=>{
    setBar('stamina', barState.stamina - 35);
    lastRunAt = Date.now();
  });

  /* vida e magika regeneram 1%/s; estamina só volta a encher 5s depois de correr */
  setInterval(()=>{
    setBar('health', barState.health + 1);
    setBar('magicka', barState.magicka + 1);
    if (Date.now() - lastRunAt >= 5000){
      setBar('stamina', barState.stamina + 3);
    }
  }, 1000);

  /* ================= JANELA DE NEGOCIAÇÃO ================= */
  const TRADE_INVENTORY = [
    { id:1,  name:'Espada de Aço',           icon:'i-swords', category:'armas',     qty:1,  weight:8   },
    { id:2,  name:'Machado de Batalha',      icon:'i-axe',    category:'armas',     qty:1,  weight:14  },
    { id:3,  name:'Escudo Reforçado',        icon:'i-shield', category:'armaduras', qty:1,  weight:12  },
    { id:4,  name:'Elmo de Ferro',           icon:'i-shield', category:'armaduras', qty:1,  weight:5   },
    { id:5,  name:'Poção de Cura',           icon:'i-heart',  category:'pocoes',    qty:6,  weight:0.5 },
    { id:6,  name:'Poção de Estamina',       icon:'i-bolt',   category:'pocoes',    qty:4,  weight:0.5 },
    { id:7,  name:'Grimório de Cura Maior',  icon:'i-book',   category:'pocoes',    qty:1,  weight:1   },
    { id:8,  name:'Nirnroot',                icon:'i-star',   category:'materiais', qty:15, weight:0.1 },
    { id:9,  name:'Escama de Dragão',        icon:'i-dragon', category:'materiais', qty:2,  weight:3   },
    { id:10, name:'Presa de Lobo',           icon:'i-wolf',   category:'materiais', qty:5,  weight:0.5 },
    { id:11, name:'Amuleto Antigo',          icon:'i-crown',  category:'diversos',  qty:1,  weight:0.2 },
    { id:12, name:'Joia Rúnica',             icon:'i-gem',    category:'diversos',  qty:3,  weight:0.3 },
  ];

  function freshTradeState(){
    return {
      mySeptimsTotal: 365,
      mySeptimsOffered: 0,
      theirSeptimsOffered: 20,
      myOffered: [],
      theirOffered: [{ id:'t1', name:'Adaga Élfica', icon:'i-swords', qty:1 }],
      myLocked: false,
      theirLocked: false,
      activeCategory: 'todos',
    };
  }
  let tradeState = freshTradeState();
  let qtyPickerItem = null;

  const tradeWindow = document.getElementById('tradeWindow');
  const tradeInventoryGrid = document.getElementById('tradeInventoryGrid');
  const tradeMyOfferList = document.getElementById('tradeMyOfferList');
  const tradeTheirOfferList = document.getElementById('tradeTheirOfferList');
  const qtyOverlay = document.getElementById('qtyOverlay');

  function offeredQtyFor(id){
    return tradeState.myOffered.filter(o=>o.id===id).reduce((s,o)=>s+o.qty,0);
  }
  function availableQtyFor(item){
    return item.qty - offeredQtyFor(item.id);
  }

  function renderTradeInventory(){
    const cat = tradeState.activeCategory;
    tradeInventoryGrid.innerHTML = '';
    TRADE_INVENTORY
      .filter(item => cat === 'todos' || item.category === cat)
      .forEach(item=>{
        const available = availableQtyFor(item);
        const card = document.createElement('div');
        card.className = 'trade-item-row' + (available <= 0 || tradeState.myLocked ? ' disabled' : '');
        card.innerHTML = `
          <div class="item-icon"><svg class="i16"><use href="#${item.icon}"/></svg></div>
          <div class="item-name">${item.name}${item.qty > 1 ? ` <em>×${available}</em>` : ''}</div>
          <div class="item-weight">${item.weight}</div>
        `;
        card.addEventListener('click', ()=>{
          if (tradeState.myLocked || available <= 0) return;
          if (available === 1){
            addToMyOffer(item, 1);
          } else {
            openQtyPicker(item, available);
          }
        });
        tradeInventoryGrid.appendChild(card);
      });
  }

  function renderTradeOfferLists(){
    tradeMyOfferList.innerHTML = '';
    if (tradeState.myOffered.length === 0){
      tradeMyOfferList.innerHTML = '<div class="trade-offer-empty">Clique em um item do seu inventário para oferecer</div>';
    } else {
      tradeState.myOffered.forEach((offer, idx)=>{
        const chip = document.createElement('div');
        chip.className = 'trade-offer-chip' + (tradeState.myLocked ? '' : ' removable');
        chip.title = tradeState.myLocked ? '' : 'Clique para remover da troca';
        chip.innerHTML = `
          <div class="item-icon"><svg class="i14"><use href="#${offer.icon}"/></svg></div>
          <div class="chip-info"><strong>${offer.name}</strong>${offer.qty > 1 ? ` ×${offer.qty}` : ''}</div>
        `;
        if (!tradeState.myLocked){
          chip.addEventListener('click', ()=> removeFromMyOffer(idx));
        }
        tradeMyOfferList.appendChild(chip);
      });
    }

    tradeTheirOfferList.innerHTML = '';
    if (tradeState.theirOffered.length === 0){
      tradeTheirOfferList.innerHTML = '<div class="trade-offer-empty">Nenhum item oferecido ainda</div>';
    } else {
      tradeState.theirOffered.forEach(offer=>{
        const chip = document.createElement('div');
        chip.className = 'trade-offer-chip';
        chip.innerHTML = `
          <div class="item-icon"><svg class="i14"><use href="#${offer.icon}"/></svg></div>
          <div class="chip-info"><strong>${offer.name}</strong>${offer.qty > 1 ? ` ×${offer.qty}` : ''}</div>
        `;
        tradeTheirOfferList.appendChild(chip);
      });
    }

    document.getElementById('tradeMySeptimsOffered').textContent = tradeState.mySeptimsOffered;
    document.getElementById('tradeTheirSeptimsOffered').textContent = tradeState.theirSeptimsOffered;
  }

  function addToMyOffer(item, qty){
    const existing = tradeState.myOffered.find(o=>o.id===item.id);
    if (existing) existing.qty += qty;
    else tradeState.myOffered.push({ id:item.id, name:item.name, icon:item.icon, qty });
    renderTradeInventory();
    renderTradeOfferLists();
  }
  function removeFromMyOffer(idx){
    tradeState.myOffered.splice(idx, 1);
    renderTradeInventory();
    renderTradeOfferLists();
  }

  function openQtyPicker(item, available){
    qtyPickerItem = item;
    document.getElementById('qtyPickerIcon').querySelector('use').setAttribute('href', '#'+item.icon);
    document.getElementById('qtyPickerName').textContent = item.name;
    document.getElementById('qtyPickerMax').textContent = available;
    const input = document.getElementById('qtyInput');
    input.value = 1; input.max = available; input.min = 1;
    qtyOverlay.hidden = false;
  }
  function closeQtyPicker(){
    qtyOverlay.hidden = true;
    qtyPickerItem = null;
  }
  document.getElementById('qtyMinus').addEventListener('click', ()=>{
    const input = document.getElementById('qtyInput');
    input.value = Math.max(1, parseInt(input.value||1,10) - 1);
  });
  document.getElementById('qtyPlus').addEventListener('click', ()=>{
    const input = document.getElementById('qtyInput');
    const max = parseInt(input.max||1,10);
    input.value = Math.min(max, parseInt(input.value||1,10) + 1);
  });
  document.getElementById('qtyCancel').addEventListener('click', closeQtyPicker);
  document.getElementById('qtyConfirm').addEventListener('click', ()=>{
    if (!qtyPickerItem) return;
    const input = document.getElementById('qtyInput');
    const max = parseInt(input.max||1,10);
    const qty = Math.min(max, Math.max(1, parseInt(input.value||1,10)));
    addToMyOffer(qtyPickerItem, qty);
    closeQtyPicker();
  });
  qtyOverlay.addEventListener('click', (e)=>{ if (e.target === qtyOverlay) closeQtyPicker(); });

  document.getElementById('tradeCategoryFilters').addEventListener('click', (e)=>{
    const btn = e.target.closest('.subtab');
    if (!btn) return;
    document.querySelectorAll('#tradeCategoryFilters .subtab').forEach(b=>b.classList.remove('is-active'));
    btn.classList.add('is-active');
    tradeState.activeCategory = btn.dataset.cat;
    renderTradeInventory();
  });

  const tradeSeptimsInput = document.getElementById('tradeSeptimsInput');
  document.getElementById('btnTradeSeptimsAdd').addEventListener('click', ()=>{
    if (tradeState.myLocked) return;
    const val = Math.min(tradeState.mySeptimsTotal, Math.max(0, parseInt(tradeSeptimsInput.value||0,10)));
    tradeState.mySeptimsOffered = val;
    tradeSeptimsInput.value = val;
    renderTradeOfferLists();
  });

  function updateTradeLockUi(){
    const myPill = document.getElementById('tradeMyLockPill');
    const theirPill = document.getElementById('tradeTheirLockPill');
    const lockBtn = document.getElementById('btnTradeLock');
    const confirmBtn = document.getElementById('btnTradeConfirm');
    const statusText = document.getElementById('tradeStatusText');

    myPill.textContent = tradeState.myLocked ? 'Trancado' : 'Destrancado';
    myPill.classList.toggle('pill-ok', tradeState.myLocked);
    theirPill.textContent = tradeState.theirLocked ? 'Trancado' : 'Destrancado';
    theirPill.classList.toggle('pill-ok', tradeState.theirLocked);

    lockBtn.classList.toggle('is-locked', tradeState.myLocked);
    lockBtn.innerHTML = tradeState.myLocked
      ? '<svg class="i16"><use href="#i-lock"/></svg>Destrancar oferta'
      : '<svg class="i16"><use href="#i-lock"/></svg>Trancar oferta';

    tradeSeptimsInput.disabled = tradeState.myLocked;
    document.getElementById('btnTradeSeptimsAdd').disabled = tradeState.myLocked;

    const bothLocked = tradeState.myLocked && tradeState.theirLocked;
    confirmBtn.disabled = !bothLocked;
    statusText.textContent = bothLocked
      ? 'Os dois jogadores trancaram a oferta. Pronto para confirmar!'
      : 'Aguardando ambos os jogadores trancarem a oferta...';

    renderTradeInventory();
    renderTradeOfferLists();
  }

  document.getElementById('btnTradeLock').addEventListener('click', ()=>{
    tradeState.myLocked = !tradeState.myLocked;
    updateTradeLockUi();
  });
  document.getElementById('btnTradeTheirLockToggle').addEventListener('click', ()=>{
    tradeState.theirLocked = !tradeState.theirLocked;
    updateTradeLockUi();
  });
  document.getElementById('btnTradeConfirm').addEventListener('click', ()=>{
    if (!tradeState.myLocked || !tradeState.theirLocked) return;
    toast('Troca concluída com sucesso!');
    closeTradeWindow();
  });

  function openTradeWindow(){
    tradeState = freshTradeState();
    tradeSeptimsInput.value = 0;
    document.querySelectorAll('#tradeCategoryFilters .subtab').forEach(b=>b.classList.remove('is-active'));
    document.querySelector('#tradeCategoryFilters .subtab[data-cat="todos"]').classList.add('is-active');
    updateTradeLockUi();
    tradeWindow.hidden = false;
  }
  function closeTradeWindow(){
    tradeWindow.hidden = true;
  }
  document.getElementById('btnOpenTrade').addEventListener('click', openTradeWindow);
  document.getElementById('btnTradeClose').addEventListener('click', closeTradeWindow);
  tradeWindow.addEventListener('click', (e)=>{ if (e.target === tradeWindow) closeTradeWindow(); });

})();
