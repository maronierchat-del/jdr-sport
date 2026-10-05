'use strict';

const STORAGE_KEY = 'fitland-jdr-save-v2';
const APP_VERSION = 4;

const FREE_ACCESS_NAMES = [
  'Fontaria','Entrepôts Shaker+','Tique-Couenne','Nosferathon','Omega Beach','Garde Froide',
  'Litière Ville','Mont Stepper','Tombe d’Arno','Temple de Tasmina','Plaine du Fitland','Sud du Fitland',
  'Forêt de Brise Mollets','Dévers du Fitland','Dunes des sacs crevés','Erythropoïéta','Oasis Interdite','Rocher de la Croupe Draconique',
  'Khôlkozia','Feï Tôro Chob','Rives de la Mer de Nuages','L’Audience du Roi','L’Arène','Le Marché libre'
].sort((a,b) => a.localeCompare(b, 'fr'));
const RESTRICTED_ACCESS_NAMES = [
  'Île des poids guidés','Antre de Mollefesse','Falaises Olympiques','Temple de la prophétie','Caverne des nuages sans fin','Exploration du Temple de Tasmina',
  'Ruines du Golem','Salle secrète de l’Oasis','La Communauté des Abdos','L’Audience du Khôl','Les Ombres de Nosferathon','Au-delà de la fin'
].sort((a,b) => a.localeCompare(b, 'fr'));
const SCENARIO_PITCH = 'Arno a disparu. Le Traître et ses légions ont envahi le Temple de Tasmina. L’équilibre du Disque-Fonte est menacé.';
const CANON_SCENARIO = [
  { title:'Prologue — Sud du Fitland', text:'Eleanore, éclaireuse débutante au service de Gylmi, surveille la lisière de la Forêt de Brise Mollets. Une intrusion de Zomfits frappe le Sud du Fitland. Eleanore repousse l’attaque : 9 Zomfits vaincus. Le Sud du Fitland est validé. Elle doit ensuite rejoindre la Plaine du Fitland.' },
  { title:'Plaine du Fitland', text:'Pendant le repli vers la Plaine du Fitland, Eleanore rencontre un collègue éclaireur. La Plaine est ensuite défendue contre une attaque : 6 Orcfits vaincus. La zone est validée.' },
  { title:'Mission actuelle — Dévers du Fitland', text:'Le collègue éclaireur confie à Eleanore une mission de repérage du Dévers du Fitland, une zone périphérique du Temple de Tasmina tombé. Le Dévers est une destination de mission, pas un accès débloqué.' }
];
const $ = (id) => document.getElementById(id);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
const clone = (value) => JSON.parse(JSON.stringify(value));
const esc = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

function makeDefaultState(){
  return {
    version: APP_VERSION,
    character: {
      name: 'Eleanore',
      className: 'Éclaireur',
      level: 1,
      path: 'Disciple d’Endurox',
      quest: 'Faire une après-midi de cueillette sans être fatiguée ensuite',
      special: 'Ramener 12 L de légumes',
      stats: { Force: 3, Endurance: 4, Agilité: 0, Dextérité: 0, Mental: 2 }
    },
    po: 495,
    equipment: [
      { id: uid(), name: 'Gants basiques', effect: 'Utilisation : punches.', qty: 1, consumable: false, damagePer30: 30, rateDamage: 10, rateSeconds: 10 },
      { id: uid(), name: 'Rame de guerre', effect: 'Résistance 1 : 150 dégâts par 30 s.', qty: 1, consumable: false, damagePer30: 150, rateDamage: 150, rateSeconds: 30, resistance: 1 }
    ],
    accesses: RESTRICTED_ACCESS_NAMES.map((name) => ({ id: uid(), name, checked: false, group: 'restricted', builtIn: true })),
    zones: [
      ...FREE_ACCESS_NAMES.map((name) => ({ id: uid(), name, validated: ['Sud du Fitland','Plaine du Fitland'].includes(name), requiresAccess: false, builtIn: true })),
      ...RESTRICTED_ACCESS_NAMES.map((name) => ({ id: uid(), name, validated: false, requiresAccess: true, accessName: name, builtIn: true }))
    ],
    scenario: CANON_SCENARIO.map((entry) => ({ id: uid(), ...entry, at: new Date().toISOString(), builtIn: true })),
    merchant: [
      { id: uid(), name:'Lest de Rame de guerre', effect:'Améliore la Rame de guerre : +1 résistance et +25 dégâts / 30 s. 7 lests disponibles au total. Résistance 8 = 325 dégâts / 30 s.', price:25, stock:7, consumable:false, damagePer30:0, kind:'rame-lest', builtIn:true }
    ],
    companions: [
      { id: uid(), name: 'Gabrielle', notes: 'Compagnon d’Eleanore.' }
    ],
    journal: [
      { id: uid(), at: new Date().toISOString(), text: 'La Plaine du Fitland est validée. 6 Orcfits vaincus, +300 PO.' }
    ],
    combat: { enemies: [] },
    lastTravel: null,
    lastDice: null,
    ui: { lastView: 'home' }
  };
}

function normalizeCanonicalData(current){
  const gants = current.equipment.find((item) => item.name === 'Gants basiques');
  if (gants) { gants.damagePer30 = 30; gants.rateDamage = 10; gants.rateSeconds = 10; if (!gants.effect || gants.effect === 'Équipement de base.') gants.effect = 'Utilisation : punches.'; }
  const rame = current.equipment.find((item) => item.name === 'Rame de guerre');
  if (rame) {
    rame.resistance = Math.max(1, Number(rame.resistance) || 1);
    rame.damagePer30 = Math.max(150, Number(rame.damagePer30) || 150);
    rame.rateDamage = rame.damagePer30; rame.rateSeconds = 30;
    rame.effect = `Résistance ${rame.resistance} : ${rame.damagePer30} dégâts par 30 s.`;
  }
  // La page Accès ne contient que les accès restreints.
  current.accesses = (Array.isArray(current.accesses) ? current.accesses : [])
    .filter((item) => !FREE_ACCESS_NAMES.includes(item.name))
    .map((item) => ({ ...item, group:'restricted' }));
  RESTRICTED_ACCESS_NAMES.forEach((name) => {
    const existing = current.accesses.find((item) => item.name === name);
    if (existing) { existing.group = 'restricted'; existing.builtIn = true; if (typeof existing.checked !== 'boolean') existing.checked = false; }
    else current.accesses.push({ id:uid(), name, checked:false, group:'restricted', builtIn:true });
  });

  // Toutes les zones (libres + restreintes) vivent dans Zones.
  const canonicalZones = [
    ...FREE_ACCESS_NAMES.map((name) => ({ name, requiresAccess:false })),
    ...RESTRICTED_ACCESS_NAMES.map((name) => ({ name, requiresAccess:true, accessName:name }))
  ];
  canonicalZones.forEach((canon) => {
    const existing = current.zones.find((zone) => zone.name === canon.name);
    if (existing) {
      existing.requiresAccess = canon.requiresAccess;
      existing.accessName = canon.accessName || null;
      existing.builtIn = true;
      if (typeof existing.validated !== 'boolean') existing.validated = false;
    } else {
      current.zones.push({ id:uid(), name:canon.name, validated:false, requiresAccess:canon.requiresAccess, accessName:canon.accessName || null, builtIn:true });
    }
  });
  // Une zone restreinte ne peut jamais rester validée sans son accès.
  current.zones.forEach((zone) => {
    if (!zone.requiresAccess) return;
    const access = current.accesses.find((item) => item.name === (zone.accessName || zone.name));
    if (!access?.checked) zone.validated = false;
  });
  CANON_SCENARIO.forEach((canon) => {
    const existing = current.scenario.find((entry) => entry.title === canon.title);
    if (existing) { existing.builtIn = true; }
    else current.scenario.push({ id:uid(), ...canon, at:new Date().toISOString(), builtIn:true });
  });
  let lest = current.merchant.find((item) => item.kind === 'rame-lest' || item.name === 'Lest de Rame de guerre');
  if (!lest) current.merchant.unshift({ id:uid(), name:'Lest de Rame de guerre', effect:'Améliore la Rame de guerre : +1 résistance et +25 dégâts / 30 s. 7 lests disponibles au total. Résistance 8 = 325 dégâts / 30 s.', price:25, stock:7, consumable:false, damagePer30:0, kind:'rame-lest', builtIn:true });
  else { Object.assign(lest,{name:'Lest de Rame de guerre',price:25,kind:'rame-lest',builtIn:true,consumable:false,effect:'Améliore la Rame de guerre : +1 résistance et +25 dégâts / 30 s. 7 lests disponibles au total. Résistance 8 = 325 dégâts / 30 s.'}); if (!Number.isFinite(Number(lest.stock))) lest.stock=7; }
  return current;
}

function mergeState(saved){
  const base = makeDefaultState();
  if (!saved || typeof saved !== 'object') return base;
  const merged = {
    ...base,
    ...saved,
    version: APP_VERSION,
    character: {
      ...base.character,
      ...(saved.character || {}),
      stats: { ...base.character.stats, ...(saved.character?.stats || {}) }
    },
    equipment: Array.isArray(saved.equipment) ? saved.equipment : base.equipment,
    accesses: Array.isArray(saved.accesses) ? saved.accesses : base.accesses,
    zones: Array.isArray(saved.zones) ? saved.zones : base.zones,
    scenario: Array.isArray(saved.scenario) ? saved.scenario : base.scenario,
    merchant: Array.isArray(saved.merchant) ? saved.merchant : base.merchant,
    companions: Array.isArray(saved.companions) ? saved.companions : base.companions,
    journal: Array.isArray(saved.journal) ? saved.journal : base.journal,
    combat: { enemies: Array.isArray(saved.combat?.enemies) ? saved.combat.enemies : [] },
    ui: { ...base.ui, ...(saved.ui || {}) }
  };
  return normalizeCanonicalData(merged);
}

function loadState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? mergeState(JSON.parse(raw)) : makeDefaultState();
  } catch (error) {
    console.warn('Sauvegarde illisible :', error);
    return makeDefaultState();
  }
}

let state = loadState();
let saveTimer;
let toastTimer;

function persist(message, { render = true } = {}){
  const indicator = $('saveState');
  indicator?.classList.add('saving');
  if (indicator) indicator.lastChild.textContent = 'Sauvegarde…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (indicator) {
        indicator.classList.remove('saving');
        indicator.lastChild.textContent = 'Sauvegardé';
      }
    } catch (error) {
      console.error(error);
      if (indicator) indicator.lastChild.textContent = 'Erreur de sauvegarde';
    }
  }, 90);
  if (message) toast(message);
  if (render) renderAll();
}

function logEvent(text){
  state.journal.unshift({ id: uid(), at: new Date().toISOString(), text });
  if (state.journal.length > 300) state.journal.length = 300;
}

function toast(text){
  const node = $('toast');
  if (!node) return;
  node.textContent = text;
  node.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), 1800);
}

function go(view){
  const target = $(`view-${view}`);
  if (!target) return;
  $$('.view').forEach((section) => section.classList.remove('active'));
  target.classList.add('active');
  const rootView = ['access','zones','scenario','merchant','companions','journal','backup'].includes(view) ? 'more' : view;
  $$('.nav-btn').forEach((button) => button.classList.toggle('active', button.dataset.view === rootView));
  state.ui.lastView = view;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderAll();
}

function formatDate(iso){
  try { return new Intl.DateTimeFormat('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }).format(new Date(iso)); }
  catch { return ''; }
}

function setValueUnlessFocused(id, value){
  const node = $(id);
  if (node && document.activeElement !== node) node.value = value ?? '';
}

function renderHome(){
  $('homeName').textContent = state.character.name;
  $('homeClass').textContent = `${state.character.className} · Niveau ${state.character.level}`;
  $('homePo').textContent = state.po;
  $('homeQuest').textContent = state.character.quest || 'Aucune quête IRL définie';
  $('homeQuestMeta').textContent = state.character.special ? `Capacité : ${state.character.special}` : 'Objectif d’aventure personnel';

  const alive = state.combat.enemies.filter((enemy) => !enemy.defeated).length;
  $('homeCombatText').textContent = alive ? `${alive} ennemi${alive > 1 ? 's' : ''} encore actif${alive > 1 ? 's' : ''}` : 'Aucun ennemi actif';
  $('homeEquipmentText').textContent = `${state.equipment.length} objet${state.equipment.length > 1 ? 's' : ''} · ${state.po} PO`;
  const validated = state.zones.filter((zone) => zone.validated).length;
  $('homeZonesText').textContent = `${validated}/${state.zones.length} validée${validated > 1 ? 's' : ''}`;

  const recent = state.journal.slice(0, 3);
  $('homeJournal').innerHTML = recent.length ? recent.map((entry) => `
    <div class="mini-event"><time>${esc(formatDate(entry.at))}</time><span>${esc(entry.text)}</span></div>
  `).join('') : '<div class="empty-state">Le journal est encore vide.</div>';
}

function renderCharacter(){
  const char = state.character;
  setValueUnlessFocused('charName', char.name);
  setValueUnlessFocused('charClass', char.className);
  setValueUnlessFocused('charLevel', char.level);
  setValueUnlessFocused('charPath', char.path);
  setValueUnlessFocused('charQuest', char.quest);
  setValueUnlessFocused('charSpecial', char.special);
  $('statsGrid').innerHTML = Object.entries(char.stats).map(([name, value]) => `
    <div class="stat-card">
      <strong>${Number(value) || 0}</strong><span>${esc(name)}</span>
      <div class="stat-controls">
        <button type="button" data-stat="${esc(name)}" data-delta="-1">−</button>
        <button type="button" data-stat="${esc(name)}" data-delta="1">+</button>
      </div>
    </div>
  `).join('');
}

function damageRateLabel(item){
  if (!Number(item.damagePer30)) return '';
  if (Number(item.rateDamage) > 0 && Number(item.rateSeconds) > 0) return `⚔ ${item.rateDamage} dégâts / ${item.rateSeconds} s`;
  return `⚔ ${item.damagePer30} dégâts / 30 s`;
}

function activeEnemy(){ return state.combat.enemies.find((enemy) => !enemy.defeated) || null; }

function travelMath(){
  const gameDistance = Math.max(0, Number($('travelDistance')?.value) || 0);
  const effortDistance = gameDistance;
  const duration = effortDistance * 5;
  return { gameDistance, effortDistance, duration };
}

function fmtNumber(value){ return Number.isInteger(value) ? String(value) : Number(value).toLocaleString('fr-FR',{maximumFractionDigits:2}); }

function updateTravelCalculation(){
  if (!$('travelDistance')) return null;
  const calc = travelMath();
  $('travelEffortDistance').textContent = `${fmtNumber(calc.effortDistance)} km`;
  $('travelCalculatedTime').textContent = `${fmtNumber(calc.duration)} min`;
  return calc;
}

function renderEquipment(){
  $('poAmount').textContent = state.po;
  $('poAmountLarge').textContent = state.po;
  $('merchantPo').textContent = state.po;
  const list = $('equipmentList');
  if (!state.equipment.length) {
    list.innerHTML = '<div class="paper-card empty-state">Le sac est vide.</div>';
    return;
  }
  list.innerHTML = state.equipment.map((item) => `
    <article class="inventory-item equipment-item">
      <div class="item-row">
        <div class="item-main">
          <div class="item-title">${esc(item.name)}${item.qty > 1 ? ` ×${item.qty}` : ''}</div>
          <div class="item-copy">${esc(item.effect || 'Aucun effet renseigné.')}</div>
          <div class="pills">
            ${item.damagePer30 ? `<span class="pill damage-pill">${esc(damageRateLabel(item))}</span>` : ''}
            ${item.consumable ? '<span class="pill gold">usage unique</span>' : ''}
          </div>
        </div>
      </div>
      <div class="item-actions">
        ${item.consumable ? `<button class="btn primary small" type="button" data-action="use-equipment" data-id="${item.id}">Utiliser</button>` : ''}
        <button class="btn ghost small" type="button" data-action="delete-equipment" data-id="${item.id}">Retirer</button>
      </div>
    </article>
  `).join('');
}

function renderTravel(){
  const t = state.lastTravel;
  if (t?.gameDistance != null && document.activeElement !== $('travelDistance')) $('travelDistance').value = t.gameDistance;
  const calc = updateTravelCalculation();
  $('lastTravel').innerHTML = t ? `Dernier trajet : <strong>${esc(t.from || '?')} → ${esc(t.to || '?')}</strong>${t.gameDistance != null ? ` · ${fmtNumber(t.gameDistance)} km dans le jeu` : ''}${t.effortDistance != null ? ` · ${fmtNumber(t.effortDistance)} km IRL` : ''}${t.duration ? ` · ${fmtNumber(t.duration)} min` : ''}` : '';
  if (state.lastDice?.rolls?.length) {
    $('diceResults').innerHTML = state.lastDice.rolls.map((roll) => `<div class="die">${roll}</div>`).join('');
    $('diceTotal').textContent = `Total : ${state.lastDice.rolls.reduce((a,b) => a+b, 0)}`;
  } else {
    $('diceResults').innerHTML = '';
    $('diceTotal').textContent = '';
  }
  renderTravelConsumables();
}

function renderTravelConsumables(){
  const items = state.equipment.filter((item) => item.consumable);
  const wrap = $('travelConsumables');
  const card = $('travelConsumablesCard');
  card.style.display = items.length ? '' : 'none';
  wrap.innerHTML = items.map((item) => `<button class="chip-btn" type="button" data-action="use-equipment" data-id="${item.id}">${esc(item.name)} ×${item.qty}</button>`).join('');
}

function renderEncounterFields(){
  const type = $('encounterType').value;
  const target = $('encounterFields');
  if (type === 'combat') {
    target.innerHTML = `
      <div class="stack">
        <div class="form-grid two">
          <label>Ennemi<input id="encName" /></label>
          <label>Nombre brut<input id="encCount" type="number" min="1" value="1" inputmode="numeric" /></label>
          <label>PV chacun<input id="encHp" type="number" min="1" value="500" inputmode="numeric" /></label>
          <label>Récompense PO chacun<input id="encReward" type="number" min="0" value="0" inputmode="numeric" /></label>
        </div>
        <div class="pill" id="soloCountLabel"></div>
        <button class="btn primary full" type="button" id="sendEncounterBtn">Envoyer au combat</button>
      </div>`;
    $('encCount').addEventListener('input', updateSoloCount);
    $('travelSolo').addEventListener('change', updateSoloCount, { once: true });
    $('sendEncounterBtn').addEventListener('click', sendEncounterToCombat);
    updateSoloCount();
  } else if (type === 'merchant') {
    target.innerHTML = '<p class="body-copy">Tu as croisé un marchand pendant le trajet.</p><button class="btn primary full" type="button" id="openMerchantBtn">Ouvrir l’échoppe</button>';
    $('openMerchantBtn').addEventListener('click', () => { logEvent('Marchand rencontré pendant un trajet.'); persist(); go('merchant'); });
  } else if (type === 'event') {
    target.innerHTML = '<div class="stack"><label>Événement<textarea id="eventText" rows="4"></textarea></label><button class="btn primary" type="button" id="saveEventBtn">Ajouter au journal</button></div>';
    $('saveEventBtn').addEventListener('click', () => {
      const text = $('eventText').value.trim();
      if (!text) return toast('Décris l’événement');
      logEvent(`Événement de trajet : ${text}`);
      persist('Événement enregistré');
      $('eventText').value = '';
    });
  } else {
    target.innerHTML = '<div class="empty-state">Aucune rencontre : la route reste tranquille.</div>';
  }
}

function updateSoloCount(){
  const label = $('soloCountLabel');
  const countInput = $('encCount');
  if (!label || !countInput) return;
  const raw = Math.max(1, Number(countInput.value) || 1);
  const solo = $('travelSolo').checked;
  label.textContent = solo ? `Trajet solo : ${raw} → ${Math.ceil(raw / 2)} ennemi${Math.ceil(raw / 2) > 1 ? 's' : ''}` : `${raw} ennemi${raw > 1 ? 's' : ''}`;
}

function renderCombat(){
  const list = $('combatEnemies');
  const alive = state.combat.enemies.filter((enemy) => !enemy.defeated);
  const current = alive[0] || null;
  const defeatedCount = state.combat.enemies.filter((enemy) => enemy.defeated).length;
  if (!current) {
    list.innerHTML = '<div class="paper-card empty-state">Aucun ennemi. Profite du calme tant qu’il dure.</div>';
    $('currentTargetLabel').textContent = 'Aucun ennemi actif';
  } else {
    const hp = Math.max(0, current.hp);
    const percent = current.maxHp ? Math.max(0, Math.min(100, hp / current.maxHp * 100)) : 0;
    const queue = alive.slice(1);
    list.innerHTML = `
      <article class="enemy-card active-enemy">
        <div class="section-kicker">Ennemi actuel</div>
        <div class="enemy-top"><div class="enemy-name">${esc(current.name)}</div><div class="enemy-hp">${hp}/${current.maxHp} PV</div></div>
        <div class="hp-track"><div class="hp-fill" style="width:${percent}%"></div></div>
        <div class="enemy-bottom"><div class="pills"><span class="pill gold">${current.reward || 0} PO</span></div><button class="btn ghost small" type="button" data-action="remove-enemy" data-id="${current.id}">Retirer</button></div>
      </article>
      ${queue.length ? `<div class="paper-card enemy-queue"><div class="section-kicker">Ensuite</div><div class="queue-list">${queue.map((enemy) => `<span>${esc(enemy.name)} · ${enemy.hp} PV</span>`).join('')}</div></div>` : ''}
      ${defeatedCount ? `<div class="combat-progress">${defeatedCount} ennemi${defeatedCount > 1 ? 's' : ''} déjà vaincu${defeatedCount > 1 ? 's' : ''}.</div>` : ''}`;
    $('currentTargetLabel').textContent = `Les dégâts s’appliquent automatiquement à ${current.name}.`;
  }
  $('applyDamageBtn').disabled = !current;
  $('manualDamageBtn').disabled = !current;
  renderDamageWeapons();
  renderCombatConsumables();
}

function renderDamageWeapons(){
  const select = $('damageWeapon');
  const current = select.value;
  const weapons = state.equipment.filter((item) => Number(item.damagePer30) > 0);
  select.innerHTML = weapons.length ? weapons.map((item) => `<option value="${item.id}">${esc(item.name)} — ${esc(damageRateLabel(item).replace('⚔ ',''))}</option>`).join('') : '<option value="">Aucun équipement avec dégâts</option>';
  if (weapons.some((item) => item.id === current)) select.value = current;
  updateDamagePreview();
}

function renderCombatConsumables(){
  const items = state.equipment.filter((item) => item.consumable);
  $('combatConsumables').innerHTML = items.length ? items.map((item) => `<button class="chip-btn" type="button" data-action="use-equipment" data-id="${item.id}">Utiliser ${esc(item.name)} ×${item.qty}</button>`).join('') : '';
}

function renderAccess(){
  const list = $('accessList');
  const collator = new Intl.Collator('fr', { sensitivity:'base' });
  const items = [...state.accesses].sort((a,b) => collator.compare(a.name,b.name));
  list.innerHTML = `<section class="paper-card access-group"><div class="card-heading"><div><div class="section-kicker">Accès restreints</div><p class="helper">Obtiens ici les clés, passages et autorisations nécessaires pour certaines zones.</p></div><strong class="access-count">${items.filter((i)=>i.checked).length}/${items.length}</strong></div><div class="check-list">${items.map((item) => `
    <div class="check-item">
      <label><input type="checkbox" data-action="toggle-access" data-id="${item.id}" ${item.checked ? 'checked' : ''}/><span>${esc(item.name)}</span></label>
      ${item.builtIn ? '' : `<button class="icon-delete" type="button" data-action="delete-access" data-id="${item.id}" aria-label="Supprimer">✕</button>`}
    </div>`).join('')}</div></section>`;
}

function renderZones(){
  const list = $('zonesList');
  const collator = new Intl.Collator('fr', { sensitivity:'base' });
  const zones = [...state.zones].sort((a,b) => collator.compare(a.name,b.name));
  list.innerHTML = zones.length ? zones.map((zone) => {
    const access = zone.requiresAccess ? state.accesses.find((item) => item.name === (zone.accessName || zone.name)) : null;
    const unlocked = !zone.requiresAccess || !!access?.checked;
    return `<div class="check-item zone-item ${unlocked ? '' : 'locked'}">
      <label><input type="checkbox" data-action="toggle-zone" data-id="${zone.id}" ${zone.validated ? 'checked' : ''} ${unlocked ? '' : 'disabled'}/><span>${esc(zone.name)}</span>${zone.requiresAccess ? `<span class="zone-lock ${unlocked ? 'unlocked' : ''}">${unlocked ? '🔓 accès obtenu' : '🔒 accès requis'}</span>` : ''}</label>
      ${zone.builtIn ? '' : `<button class="icon-delete" type="button" data-action="delete-zone" data-id="${zone.id}" aria-label="Supprimer">✕</button>`}
    </div>`;
  }).join('') : '<div class="empty-state">Aucune zone ajoutée.</div>';
}

function renderScenario(){
  const list = $('scenarioList');
  const canonOrder = new Map(CANON_SCENARIO.map((entry,index) => [entry.title,index]));
  const entries = [...state.scenario].sort((a,b) => {
    if (a.builtIn && b.builtIn) return (canonOrder.get(a.title) ?? 999) - (canonOrder.get(b.title) ?? 999);
    if (a.builtIn) return -1; if (b.builtIn) return 1;
    return new Date(a.at || 0) - new Date(b.at || 0);
  });
  list.innerHTML = `
    <article class="scenario-card scenario-pitch"><div class="section-kicker">Pitch de départ</div><h2>Le Disque-Fonte est menacé</h2><p>${esc(SCENARIO_PITCH)}</p></article>
    <div class="scenario-separator"><span>Scénario découvert</span></div>
    ${entries.length ? entries.map((entry) => `
      <article class="scenario-card ${entry.builtIn ? 'canon' : ''}">
        <div class="item-row"><h2>${esc(entry.title || 'Passage découvert')}</h2>${entry.builtIn ? '' : `<button class="icon-delete" type="button" data-action="delete-scenario" data-id="${entry.id}">✕</button>`}</div>
        <p>${esc(entry.text)}</p>
        ${entry.builtIn ? '<div class="scenario-date">Déjà découvert</div>' : `<div class="scenario-date">${esc(formatDate(entry.at))}</div>`}
      </article>`).join('') : '<div class="paper-card empty-state">Le scénario se remplira au fur et à mesure de ce que tu découvres.</div>'}`;
}

function renderMerchant(){
  $('merchantPo').textContent = state.po;
  const list = $('merchantList');
  list.innerHTML = state.merchant.length ? state.merchant.map((item) => `
    <article class="inventory-item">
      <div class="item-row">
        <div class="item-main"><div class="item-title">${esc(item.name)}</div><div class="item-copy">${esc(item.effect || 'Aucun effet renseigné.')}</div>
          <div class="pills"><span class="pill gold">${item.price} PO</span><span class="pill">stock ${item.stock}</span>${item.consumable ? '<span class="pill">consommable</span>' : ''}${item.kind === 'rame-lest' ? '<span class="pill damage-pill">⚔ +25 dégâts / 30 s</span>' : (item.damagePer30 ? `<span class="pill damage-pill">⚔ ${item.damagePer30} dégâts / 30 s</span>` : '')}</div>
        </div>
      </div>
      <div class="item-actions"><button class="btn primary small" type="button" data-action="buy-item" data-id="${item.id}" ${item.stock <= 0 ? 'disabled' : ''}>Acheter</button>${item.builtIn ? '' : `<button class="btn ghost small" type="button" data-action="delete-shop" data-id="${item.id}">Retirer</button>`}</div>
    </article>`).join('') : '<div class="paper-card empty-state">L’échoppe est vide. Ajoute les articles du marchand rencontré.</div>';
}

function renderCompanions(){
  const list = $('companionsList');
  list.innerHTML = state.companions.length ? state.companions.map((companion) => `
    <article class="companion-card">
      <div class="companion-avatar">✦</div>
      <div class="companion-main"><div class="item-title">${esc(companion.name)}</div><p>${esc(companion.notes || 'Aucune note.')}</p></div>
      <button class="icon-delete" type="button" data-action="delete-companion" data-id="${companion.id}">✕</button>
    </article>`).join('') : '<div class="paper-card empty-state">Aucun compagnon de route.</div>';
}

function renderJournal(){
  const list = $('journalList');
  list.innerHTML = state.journal.length ? state.journal.map((entry) => `
    <article class="journal-entry"><div class="journal-mark">✦</div><div><time>${esc(formatDate(entry.at))}</time><p>${esc(entry.text)}</p></div></article>`).join('') : '<div class="paper-card empty-state">Le journal est vide.</div>';
}

function renderAll(){
  renderHome();
  renderCharacter();
  renderEquipment();
  renderTravel();
  renderCombat();
  renderAccess();
  renderZones();
  renderScenario();
  renderMerchant();
  renderCompanions();
  renderJournal();
}

function saveCharacterFromInputs(){
  state.character.name = $('charName').value.trim() || 'Eleanore';
  state.character.className = $('charClass').value.trim();
  state.character.level = Math.max(1, Number($('charLevel').value) || 1);
  state.character.path = $('charPath').value.trim();
  state.character.quest = $('charQuest').value.trim();
  state.character.special = $('charSpecial').value.trim();
  persist(null, { render: false });
  renderHome();
}

function addEquipment(){
  const name = $('eqName').value.trim();
  if (!name) return toast('Donne un nom à l’objet');
  state.equipment.push({
    id: uid(), name,
    effect: $('eqEffect').value.trim(),
    qty: Math.max(1, Number($('eqQty').value) || 1),
    consumable: $('eqConsumable').checked,
    damagePer30: Math.max(0, Number($('eqDamage').value) || 0),
    rateDamage: Math.max(0, Number($('eqDamage').value) || 0), rateSeconds: 30
  });
  logEvent(`Objet ajouté : ${name}.`);
  $('eqName').value = ''; $('eqEffect').value = ''; $('eqQty').value = 1; $('eqDamage').value = 0; $('eqConsumable').checked = false;
  persist('Objet ajouté');
}

function useEquipment(id){
  const item = state.equipment.find((entry) => entry.id === id);
  if (!item || !item.consumable) return;
  item.qty -= 1;
  logEvent(`${item.name} utilisé.`);
  if (item.qty <= 0) state.equipment = state.equipment.filter((entry) => entry.id !== id);
  persist(`${item.name} utilisé`);
}

function saveTravel(){
  const calc = updateTravelCalculation() || travelMath();
  const travel = {
    from: $('travelFrom').value.trim(), to: $('travelTo').value.trim(),
    gameDistance: calc.gameDistance, effortDistance: calc.effortDistance, duration: calc.duration,
    solo: $('travelSolo').checked, at: new Date().toISOString()
  };
  state.lastTravel = travel;
  logEvent(`Trajet ${travel.from || '?'} → ${travel.to || '?'} · ${fmtNumber(travel.gameDistance)} km dans le jeu · ${fmtNumber(travel.effortDistance)} km IRL · ${fmtNumber(travel.duration)} min.`);
  persist('Trajet enregistré');
}

function secureDie(sides){
  if (crypto?.getRandomValues) {
    const max = 0x100000000 - (0x100000000 % sides);
    const array = new Uint32Array(1);
    do { crypto.getRandomValues(array); } while (array[0] >= max);
    return (array[0] % sides) + 1;
  }
  return Math.floor(Math.random() * sides) + 1;
}

function rollDice(){
  const count = Math.min(12, Math.max(1, Number($('diceCount').value) || 1));
  const sides = Math.max(2, Number($('diceSides').value) || 6);
  const rolls = Array.from({ length: count }, () => secureDie(sides));
  state.lastDice = { rolls, sides, at: new Date().toISOString() };
  logEvent(`Dés de rencontre : ${rolls.join(' + ')} (d${sides}) = ${rolls.reduce((a,b) => a+b, 0)}.`);
  persist();
}

function addEnemyInstances(name, count, hp, reward){
  for (let i = 1; i <= count; i += 1) {
    state.combat.enemies.push({
      id: uid(), name: count > 1 ? `${name} ${i}` : name,
      maxHp: hp, hp, reward, defeated: false, rewarded: false
    });
  }
}

function sendEncounterToCombat(){
  const name = $('encName').value.trim();
  if (!name) return toast('Nom de l’ennemi manquant');
  const raw = Math.max(1, Number($('encCount').value) || 1);
  const count = $('travelSolo').checked ? Math.ceil(raw / 2) : raw;
  const hp = Math.max(1, Number($('encHp').value) || 1);
  const reward = Math.max(0, Number($('encReward').value) || 0);
  addEnemyInstances(name, count, hp, reward);
  logEvent(`Rencontre de trajet : ${count} ${name}${count > 1 ? 's' : ''}.`);
  persist('Ennemis envoyés au combat');
  go('combat');
}

function addEnemyManual(){
  const name = $('enemyName').value.trim();
  if (!name) return toast('Nom de l’ennemi manquant');
  const count = Math.max(1, Number($('enemyCount').value) || 1);
  const hp = Math.max(1, Number($('enemyHp').value) || 1);
  const reward = Math.max(0, Number($('enemyReward').value) || 0);
  addEnemyInstances(name, count, hp, reward);
  logEvent(`Combat : ${count} ${name}${count > 1 ? 's' : ''} ajouté${count > 1 ? 's' : ''}.`);
  $('enemyName').value = '';
  persist('Ennemis ajoutés');
}

function updateDamagePreview(){
  const item = state.equipment.find((entry) => entry.id === $('damageWeapon').value);
  const seconds = Math.max(0, Number($('effortSeconds').value) || 0);
  const damage = item ? Math.round((Number(item.damagePer30) || 0) * seconds / 30) : 0;
  $('damagePreview').textContent = damage;
  return damage;
}

function dealDamage(damage){
  const enemy = activeEnemy();
  if (!enemy || !damage) return;
  enemy.hp = Math.max(0, enemy.hp - damage);
  logEvent(`${damage} dégâts infligés à ${enemy.name}.`);
  if (enemy.hp <= 0 && !enemy.defeated) {
    enemy.defeated = true;
    if (!enemy.rewarded) {
      state.po += Number(enemy.reward) || 0;
      enemy.rewarded = true;
    }
    logEvent(`${enemy.name} vaincu${enemy.reward ? ` : +${enemy.reward} PO` : ''}.`);
  }
  persist(enemy.defeated ? 'Ennemi vaincu ! Ennemi suivant.' : 'Dégâts appliqués');
}

function addAccess(){
  const name = $('accessName').value.trim();
  if (!name) return;
  state.accesses.push({ id: uid(), name, checked:false, group:'restricted', builtIn:false });
  $('accessName').value = '';
  persist('Accès restreint ajouté');
}

function addZone(){
  const name = $('zoneName').value.trim();
  if (!name) return;
  state.zones.push({ id: uid(), name, validated: false });
  $('zoneName').value = '';
  persist('Zone ajoutée');
}

function addScenario(){
  const text = $('scenarioText').value.trim();
  if (!text) return toast('Ajoute le texte découvert');
  const title = $('scenarioTitle').value.trim();
  state.scenario.unshift({ id: uid(), title, text, at: new Date().toISOString() });
  logEvent(`Scénario découvert${title ? ` : ${title}` : ''}.`);
  $('scenarioTitle').value = ''; $('scenarioText').value = '';
  persist('Passage ajouté');
}

function addShopItem(){
  const name = $('shopName').value.trim();
  if (!name) return toast('Donne un nom à l’article');
  state.merchant.push({
    id: uid(), name,
    effect: $('shopEffect').value.trim(),
    price: Math.max(0, Number($('shopPrice').value) || 0),
    stock: Math.max(1, Number($('shopStock').value) || 1),
    consumable: $('shopConsumable').checked,
    damagePer30: Math.max(0, Number($('shopDamage').value) || 0)
  });
  $('shopName').value = ''; $('shopEffect').value = ''; $('shopPrice').value = 0; $('shopStock').value = 1; $('shopDamage').value = 0; $('shopConsumable').checked = false;
  persist('Article ajouté');
}

function buyItem(id){
  const item = state.merchant.find((entry) => entry.id === id);
  if (!item || item.stock <= 0) return;
  if (state.po < item.price) return toast('Pas assez de PO');
  if (item.kind === 'rame-lest') {
    const rame = state.equipment.find((entry) => entry.name === 'Rame de guerre');
    if (!rame) return toast('Il faut posséder la Rame de guerre');
    state.po -= item.price;
    item.stock -= 1;
    rame.resistance = Math.min(8, Math.max(1, Number(rame.resistance) || 1) + 1);
    rame.damagePer30 = Math.min(325, (Number(rame.damagePer30) || 150) + 25);
    rame.rateDamage = rame.damagePer30; rame.rateSeconds = 30;
    rame.effect = `Résistance ${rame.resistance} : ${rame.damagePer30} dégâts par 30 s.`;
    logEvent(`Lest de Rame de guerre acheté : −${item.price} PO. Rame résistance ${rame.resistance}, ${rame.damagePer30} dégâts / 30 s.`);
    persist('Rame de guerre améliorée');
    return;
  }
  state.po -= item.price;
  item.stock -= 1;
  const owned = state.equipment.find((entry) => entry.name.toLowerCase() === item.name.toLowerCase() && entry.consumable === item.consumable && Number(entry.damagePer30) === Number(item.damagePer30));
  if (owned) owned.qty += 1;
  else state.equipment.push({ id: uid(), name:item.name, effect:item.effect, qty:1, consumable:item.consumable, damagePer30:item.damagePer30, rateDamage:item.damagePer30, rateSeconds:30 });
  logEvent(`${item.name} acheté : −${item.price} PO.`);
  persist('Achat effectué');
}

function addCompanion(){
  const name = $('compName').value.trim();
  if (!name) return toast('Donne un nom au compagnon');
  state.companions.push({ id: uid(), name, notes: $('compNotes').value.trim() });
  $('compName').value = ''; $('compNotes').value = '';
  logEvent(`${name} rejoint les compagnons.`);
  persist('Compagnon ajouté');
}

function openNumberModal({ title, label, value = 0, confirmText = 'Valider', onConfirm }){
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true">
      <div class="section-kicker">Action</div><h2>${esc(title)}</h2>
      <label>${esc(label)}<input class="modal-number" type="number" value="${Number(value) || 0}" inputmode="decimal" /></label>
      <div class="button-row"><button class="btn ghost modal-cancel" type="button">Annuler</button><button class="btn primary modal-confirm" type="button">${esc(confirmText)}</button></div>
    </div>`;
  document.body.appendChild(backdrop);
  const input = backdrop.querySelector('.modal-number');
  input.focus(); input.select();
  const close = () => backdrop.remove();
  backdrop.querySelector('.modal-cancel').addEventListener('click', close);
  backdrop.addEventListener('click', (event) => { if (event.target === backdrop) close(); });
  backdrop.querySelector('.modal-confirm').addEventListener('click', () => { const n = Number(input.value); if (Number.isFinite(n)) onConfirm(n); close(); });
  input.addEventListener('keydown', (event) => { if (event.key === 'Enter') backdrop.querySelector('.modal-confirm').click(); if (event.key === 'Escape') close(); });
}

function exportSave(){
  const blob = new Blob([JSON.stringify(state, null, 2)], { type:'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `fitland-sauvegarde-${new Date().toISOString().slice(0,10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast('Sauvegarde exportée');
}

function importSave(event){
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data.character || !Array.isArray(data.equipment)) throw new Error('Format invalide');
      state = mergeState(data);
      persist('Sauvegarde importée');
      go('home');
    } catch {
      toast('Fichier de sauvegarde invalide');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function resetGame(){
  if (!confirm('Réinitialiser toute la partie ? Cette action efface la sauvegarde locale de cette application.')) return;
  state = makeDefaultState();
  persist('Partie réinitialisée');
  go('home');
}

function handleDelegatedClick(event){
  const goButton = event.target.closest('[data-go]');
  if (goButton) { go(goButton.dataset.go); return; }

  const statButton = event.target.closest('[data-stat]');
  if (statButton) {
    const name = statButton.dataset.stat;
    state.character.stats[name] = Math.max(0, (Number(state.character.stats[name]) || 0) + Number(statButton.dataset.delta || 0));
    persist();
    return;
  }

  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;
  const { action, id } = actionButton.dataset;

  if (action === 'use-equipment') useEquipment(id);
  if (action === 'delete-equipment') { state.equipment = state.equipment.filter((item) => item.id !== id); persist('Objet retiré'); }
  if (action === 'remove-enemy') { state.combat.enemies = state.combat.enemies.filter((enemy) => enemy.id !== id); persist('Ennemi retiré'); }
  if (action === 'delete-access') { state.accesses = state.accesses.filter((item) => item.id !== id || item.builtIn); persist(); }
  if (action === 'delete-zone') { state.zones = state.zones.filter((item) => item.id !== id); persist(); }
  if (action === 'delete-scenario') { state.scenario = state.scenario.filter((item) => item.id !== id || item.builtIn); persist(); }
  if (action === 'delete-shop') { state.merchant = state.merchant.filter((item) => item.id !== id || item.builtIn); persist(); }
  if (action === 'buy-item') buyItem(id);
  if (action === 'delete-companion') { state.companions = state.companions.filter((item) => item.id !== id); persist(); }
}

function handleDelegatedChange(event){
  const input = event.target;
  if (input.dataset.action === 'toggle-access') {
    const item = state.accesses.find((entry) => entry.id === input.dataset.id);
    if (!item) return;
    item.checked = input.checked;
    if (!item.checked) {
      const linkedZone = state.zones.find((zone) => zone.requiresAccess && (zone.accessName || zone.name) === item.name);
      if (linkedZone?.validated) linkedZone.validated = false;
    }
    logEvent(`${item.name} : accès ${item.checked ? 'obtenu' : 'retiré'}.`);
    persist(item.checked ? 'Accès obtenu' : 'Accès retiré');
  }
  if (input.dataset.action === 'toggle-zone') {
    const zone = state.zones.find((entry) => entry.id === input.dataset.id);
    if (!zone) return;
    if (zone.requiresAccess) {
      const access = state.accesses.find((item) => item.name === (zone.accessName || zone.name));
      if (!access?.checked) {
        input.checked = false;
        return toast(`Accès requis : ${zone.accessName || zone.name}`);
      }
    }
    zone.validated = input.checked;
    logEvent(`${zone.name} ${zone.validated ? 'validée ✅' : 'marquée non validée'}.`);
    persist(zone.validated ? 'Zone validée !' : 'Zone mise à jour');
  }
}

function bindEvents(){
  document.addEventListener('click', handleDelegatedClick);
  document.addEventListener('change', handleDelegatedChange);

  ['charName','charClass','charLevel','charPath','charQuest','charSpecial'].forEach((id) => $(id).addEventListener('input', saveCharacterFromInputs));
  $('adjustPoBtn').addEventListener('click', () => openNumberModal({ title:'Ajuster la bourse', label:'Ajouter ou retirer des poids d’or (ex. 50 ou -20)', value:0, confirmText:'Modifier', onConfirm:(delta) => { state.po = Math.max(0, state.po + delta); logEvent(`${delta >= 0 ? '+' : ''}${delta} PO. Solde : ${state.po} PO.`); persist('PO mis à jour'); } }));
  $('addEquipmentBtn').addEventListener('click', addEquipment);
  $('saveTravelBtn').addEventListener('click', saveTravel);
  $('rollDiceBtn').addEventListener('click', rollDice);
  $('encounterType').addEventListener('change', renderEncounterFields);
  $('travelSolo').addEventListener('change', updateSoloCount);
  $('travelDistance').addEventListener('input', updateTravelCalculation);
  $('addEnemyBtn').addEventListener('click', addEnemyManual);
  $('damageWeapon').addEventListener('change', updateDamagePreview);
  $('effortSeconds').addEventListener('input', updateDamagePreview);
  $('applyDamageBtn').addEventListener('click', () => { const damage = updateDamagePreview(); if (!damage) return toast('Aucun dégât à appliquer'); dealDamage(damage); });
  $('manualDamageBtn').addEventListener('click', () => openNumberModal({ title:'Dégâts manuels', label:'Nombre de dégâts', value:0, onConfirm:(damage) => { damage = Math.max(0, damage); if (damage) dealDamage(damage); } }));
  $('addAccessBtn').addEventListener('click', addAccess);
  $('addZoneBtn').addEventListener('click', addZone);
  $('addScenarioBtn').addEventListener('click', addScenario);
  $('addShopItemBtn').addEventListener('click', addShopItem);
  $('addCompanionBtn').addEventListener('click', addCompanion);
  $('clearJournalBtn').addEventListener('click', () => { if (confirm('Vider le journal d’aventure ?')) { state.journal = []; persist('Journal vidé'); } });
  $('exportBtn').addEventListener('click', exportSave);
  $('importFile').addEventListener('change', importSave);
  $('resetBtn').addEventListener('click', resetGame);
}

async function requestPersistentStorage(){
  try { if (navigator.storage?.persist) await navigator.storage.persist(); } catch {}
}

function init(){
  bindEvents();
  renderEncounterFields();
  renderAll();
  requestPersistentStorage();
  go(state.ui.lastView || 'home');
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
}

document.addEventListener('DOMContentLoaded', init);
