'use strict';

const STORAGE_KEY = 'fitland-jdr-save-v2';
const APP_VERSION = 9;

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
const SCENARIO_PITCH = 'Arno ayant disparu de longue date, en d’étranges circonstances, de sombres puissances s’agitent dans l’ombre. Le traître et ses légions impies ont envahi le Temple de Tasmina. En l’absence de son protecteur, qui ramènera l’équilibre ?';

const CANON_SCENARIO = [
  { canonicalKey:'depart', title:'Départ', text:'Eleanore, éclaireuse débutante, surveille la lisière de la Forêt de Brise Mollets. Une intrusion de Zomfits frappe le Sud du Fitland. Eleanore se replie dans la Plaine du Fitland.' },
  { canonicalKey:'plaine', title:'Plaine du Fitland', text:'Pendant le repli vers la Plaine du Fitland, Eleanore rencontre un collègue éclaireur, qui lui confie une mission de repérage du Dévers du Fitland, une zone périphérique du Temple de Tasmina tombé.' }
];
const LEGACY_CANON_SCENARIO_TITLES = new Set(['Prologue — Sud du Fitland','Plaine du Fitland','Mission actuelle — Dévers du Fitland']);
const ENCOUNTER_TABLE = {
  7:  { name:'Liquebide', effect:'×10 sur le dé de quantité.', zones:'Fitland, Maaskinland', reward:5, hp:50, quantityMultiplier:10 },
  8:  { name:'Chardio', effect:'NA', zones:'Toutes', reward:5, hp:50 },
  9:  { name:'Gnome Zombie', effect:'NA', zones:'Fitland, Maaskinland', reward:10, hp:100 },
  10: { name:'Acromide', effect:'NA', zones:'Fitland, Maaskinland', reward:10, hp:100 },
  11: { name:'Selfine', effect:'Fermez les yeux.', zones:'Fitland, Maaskinland', reward:10, hp:100 },
  12: { name:'Gebeleau', effect:'NA', zones:'Toutes', reward:10, hp:100 },
  13: { name:'Fitnéant', effect:'NA', zones:'Fitland, Maaskinland', reward:10, hp:100 },
  14: { name:'Gnome zombie', effect:'NA', zones:'Maaskinland', reward:10, hp:100 },
  15: { name:'Trollympien', effect:'Ajoutez +2 au jet de contexte.', zones:'Fitland', reward:150, hp:1500, contextBonus:2 },
  16: { name:'Plantosaure', effect:'NA', zones:'Fitland, Maaskinland, Anabolie', reward:15, hp:150 },
  17: { name:'Zomfit', effect:'NA', zones:'Fitland, Anabolie', reward:15, hp:150 },
  18: { name:'Squatosaure', effect:'NA', zones:'Fitland, Pays des Khôls, Anabolie', reward:20, hp:200 },
  19: { name:'Zumbhaka', effect:'Dansez.', zones:'Fitland, Anabolie', reward:30, hp:300 },
  20: { name:'Pillard Martial', effect:'NA', zones:'Toutes', reward:40, hp:400 },
  21: { name:'Mesossé', effect:'NA', zones:'Fitland, Anabolie', reward:50, hp:500 },
  22: { name:'Guerrier Khol', effect:'NA', zones:'Toutes', reward:50, hp:500 },
  23: { name:'Orcfit', effect:'Posing Culturiste avant chaque attaque.', zones:'Fitland', reward:50, hp:500 },
  24: { name:'Nosferathonien', effect:'NA', zones:'Toutes', reward:50, hp:500 },
  25: { name:'Transpinia', effect:'NA', zones:'Toutes', reward:70, hp:700 },
  26: { name:'Permabulker', effect:'NA', zones:'Toutes', reward:100, hp:1000 },
  27: { name:'Chathlète', effect:'NA', zones:'Fitland', reward:100, hp:1000 },
  28: { name:'Powerchat', effect:'NA', zones:'Fitland', reward:150, hp:1500 },
  29: { name:'Abomination', effect:'Ne lancez pas le dé de quantité.', zones:'Fitland, Maaskinland', reward:300, hp:3000, skipQuantity:true },
  30: { name:'Bulkoeil', effect:'Ne lancez pas le dé de quantité.', zones:'Toutes', reward:300, hp:3000, skipQuantity:true },
  31: { name:'Chose', effect:'Ne lancez pas le dé de quantité.', zones:'Anabolie', reward:300, hp:3000, skipQuantity:true },
  32: { name:'Hydrocoolique', effect:'Ne lancez pas le dé de quantité.', zones:'Falaises Olympiques, Omega Beach', reward:900, hp:9000, skipQuantity:true },
  33: { name:'Nécrolifter', effect:'Ne lancez pas le dé de quantité.', zones:'Toutes', reward:300, hp:3000, skipQuantity:true },
  34: { name:'Marchand Itinérant', effect:'Inoffensif. Commercez.', zones:'Toutes sauf Fitland', reward:null, hp:null, kind:'merchant' },
  35: { name:'Gardes du Fitland', effect:'Perdez tous vos PO ou affrontez-les. Ne lancez pas le dé de quantité.', zones:'Fitland', reward:1000, hp:10000, skipQuantity:true },
  36: { name:'Bulker Fruité', effect:'Inoffensif. Obtenez un shaker de votre choix.', zones:'Toutes', reward:400, hp:4000 },
  37: { name:'Chevalier Templiométrique', effect:'Inoffensif. Aucune rencontre jusqu’à votre prochaine destination.', zones:'Toutes', reward:300, hp:3000 },
  38: { name:'Elfit', effect:'Inoffensif. Échangez un objet contre un bijou de mage.', zones:'Toutes', reward:100, hp:1000 },
  39: { name:'Amazone', effect:'Inoffensif. Échangez un objet contre un objet féerique de votre choix.', zones:'Toutes', reward:100, hp:1000 },
  40: { name:'Bibilithe', effect:'Perdez un objet et tous vos PO ou affrontez-le.', zones:'Toutes', reward:200, hp:2000 },
  41: { name:'Clan Nazcool', effect:'Affrontez-les ou l’Orienteur obsédé ne vous poursuit plus. Ne lancez pas le dé de quantité.', zones:'Toutes', reward:900, hp:9000, skipQuantity:true },
  42: { name:'Orienteur obsédé', effect:'L’Orienteur obsédé vous poursuit : affrontez-le à chaque prochaine rencontre en supplément. Ne lancez pas le dé de quantité.', zones:'Toutes', reward:0, hp:400, skipQuantity:true }
};

const ENCOUNTER_CONTEXTS = {
  1: { context:'Vous êtes piégé !', exercise:'10 Burpees par Quantité' },
  2: { context:'Une embuscade !', exercise:'Multipliez par 2 les durées d’utilisation de vos objets' },
  3: { context:'Ils arrivent !', exercise:'50 Jumping Jacks' },
  4: { context:'Ils ne vous échapperont pas.', exercise:'20 Jumping Jacks' },
  5: { context:'Ils sont à votre merci.', exercise:'Rien' },
  6: { context:'Ils n’ont rien vu.', exercise:'Vous pouvez éviter la Rencontre.' }
};

function freshEncounterState(){
  return {
    typeRolls: [], total: null, resultNumber: null, zoneConfirmed: false, passed: false,
    quantityRaw: null, quantityBeforeSolo: null, quantityFinal: null,
    contextRaw: null, contextFinal: null,
    travelId: null, combatStarted: false, combatEnemyIds: []
  };
}
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
    currentLocation: 'Plaine du Fitland',
    activeTravel: null,
    lastTravel: null,
    lastDice: null,
    encounter: freshEncounterState(),
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
  // Migration de l'ancien scénario canonique vers les deux nouvelles cases éditables.
  const hasLegacyScenario = current.scenario.some((entry) => entry.builtIn && !entry.canonicalKey && LEGACY_CANON_SCENARIO_TITLES.has(entry.title));
  if (hasLegacyScenario) {
    current.scenario = current.scenario.filter((entry) => !(entry.builtIn && !entry.canonicalKey && LEGACY_CANON_SCENARIO_TITLES.has(entry.title)));
  }
  CANON_SCENARIO.forEach((canon) => {
    const existing = current.scenario.find((entry) => entry.canonicalKey === canon.canonicalKey);
    if (existing) {
      existing.builtIn = true;
    } else {
      current.scenario.push({ id:uid(), ...canon, at:new Date().toISOString(), builtIn:true });
    }
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
    currentLocation: typeof saved.currentLocation === 'string' && saved.currentLocation.trim() ? saved.currentLocation.trim() : base.currentLocation,
    activeTravel: saved.activeTravel && typeof saved.activeTravel === 'object' ? saved.activeTravel : null,
    encounter: { ...base.encounter, ...(saved.encounter || {}), combatEnemyIds: Array.isArray(saved.encounter?.combatEnemyIds) ? saved.encounter.combatEnemyIds : [] },
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
let editingScenarioId = null;
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
  const rootView = view === 'encounter' ? 'travel' : (['access','zones','scenario','merchant','companions','journal','backup'].includes(view) ? 'more' : view);
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


function findZoneByName(name){
  const target = String(name || '').trim().toLocaleLowerCase('fr');
  if (!target) return null;
  return state.zones.find((zone) => zone.name.trim().toLocaleLowerCase('fr') === target) || null;
}

function isZoneUnlocked(zone){
  if (!zone?.requiresAccess) return true;
  const access = state.accesses.find((item) => item.name === (zone.accessName || zone.name));
  return !!access?.checked;
}

function editCurrentLocation(){
  if (state.activeTravel && ['in_progress','encounter'].includes(state.activeTravel.status)) {
    return toast('Termine d’abord le trajet en cours');
  }
  const value = prompt('Position actuelle d’Eleanore', state.currentLocation || '');
  if (value == null) return;
  const next = value.trim();
  if (!next) return toast('La position ne peut pas être vide');
  state.currentLocation = next;
  if (state.activeTravel?.status === 'arrived') state.activeTravel = null;
  logEvent(`Position d’Eleanore : ${next}.`);
  persist('Position mise à jour');
}

function validateArrivalZone(){
  const trip = state.activeTravel;
  if (!trip || trip.status !== 'arrived') return;
  const zone = findZoneByName(trip.to);
  if (!zone) return toast('Cette destination n’est pas dans la liste des zones');
  if (!isZoneUnlocked(zone)) return toast(`Accès requis : ${zone.accessName || zone.name}`);
  if (zone.validated) return toast('Cette zone est déjà validée');
  zone.validated = true;
  logEvent(`${zone.name} validée ✅ depuis l’arrivée du trajet.`);
  persist('Zone validée !');
}

function completeActiveTravelArrival(message, nextView = 'travel'){
  const trip = state.activeTravel;
  if (message) logEvent(message);
  if (trip && trip.status === 'encounter') {
    trip.status = 'arrived';
    trip.encounterCompleted = true;
    trip.arrivedAt = new Date().toISOString();
    state.currentLocation = trip.to;
    state.lastTravel = { ...trip };
    logEvent(`Arrivée à ${trip.to}. Eleanore est maintenant sur place.`);
  }
  resetEncounter({ render:false });
  if ($('travelTo')) $('travelTo').value = '';
  persist('Arrivée enregistrée', { render:false });
  go(nextView);
}

function validateActiveTravel(){
  const trip = state.activeTravel;
  if (!trip || trip.status !== 'in_progress') return;
  trip.effortCompletedAt = new Date().toISOString();
  logEvent(`Effort IRL terminé pour ${trip.from} → ${trip.to}.`);
  if ((Number(trip.encounterCount) || 0) < 1) {
    trip.status = 'encounter';
    completeActiveTravelArrival('Trajet terminé : moins de 6 km, aucune rencontre générée.');
    return;
  }
  trip.status = 'encounter';
  state.encounter = freshEncounterState();
  state.encounter.travelId = trip.id;
  persist('Trajet validé — rencontre à résoudre', { render:false });
  go('encounter');
}

function renderJourneyCard(){
  const wrap = $('activeJourneyCard');
  if (!wrap) return;
  const trip = state.activeTravel;
  if (!trip) { wrap.innerHTML = ''; return; }
  const stats = `<div class="journey-stats"><div><span>Distance</span><strong>${fmtNumber(trip.gameDistance)} km</strong></div><div><span>Effort IRL</span><strong>${fmtNumber(trip.effortDistance)} km</strong></div><div><span>Temps</span><strong>${fmtNumber(trip.duration)} min</strong>${trip.scoutBonus ? '<small>Bonus Éclaireur ×½</small>' : ''}</div></div>`;
  if (trip.status === 'in_progress') {
    wrap.innerHTML = `<section class="paper-card journey-card"><div class="journey-head"><div><div class="section-kicker">Trajet enregistré</div><h2>Effort en cours</h2></div><span class="journey-badge">En route</span></div><div class="journey-route">${esc(trip.from)} → ${esc(trip.to)}</div>${stats}<p class="journey-progress-note">Eleanore est encore à <strong>${esc(trip.from)}</strong>. Quand l’effort IRL est réellement terminé, valide le trajet : la rencontre sera alors générée.</p><button class="btn primary full" type="button" id="validateTravelProgressBtn">✓ Effort IRL terminé — valider le trajet</button></section>`;
    $('validateTravelProgressBtn')?.addEventListener('click', validateActiveTravel);
    return;
  }
  if (trip.status === 'encounter') {
    const inCombat = !!state.encounter?.combatStarted;
    wrap.innerHTML = `<section class="paper-card journey-card"><div class="journey-head"><div><div class="section-kicker">Trajet validé</div><h2>Rencontre en cours</h2></div><span class="journey-badge">Avant l’arrivée</span></div><div class="journey-route">${esc(trip.from)} → ${esc(trip.to)}</div>${stats}<p class="journey-progress-note">L’effort IRL est terminé. Eleanore n’arrivera à <strong>${esc(trip.to)}</strong> qu’une fois la rencontre résolue.</p><button class="btn primary full" type="button" id="resumeTravelEncounterBtn">${inCombat ? '⚔ Reprendre le combat' : '🎲 Reprendre la rencontre'}</button></section>`;
    $('resumeTravelEncounterBtn')?.addEventListener('click', () => go(inCombat ? 'combat' : 'encounter'));
    return;
  }
  if (trip.status === 'arrived') {
    const zone = findZoneByName(trip.to);
    let zonePart = '<p class="helper">Cette destination n’est pas répertoriée comme zone.</p>';
    if (zone) {
      if (zone.validated) zonePart = `<div class="arrival-zone-status"><strong>✅ ${esc(zone.name)} est validée</strong><button class="btn ghost small" type="button" data-go="zones">Voir les zones</button></div>`;
      else if (!isZoneUnlocked(zone)) zonePart = `<div class="arrival-zone-status"><strong>🔒 ${esc(zone.name)} : accès requis</strong><button class="btn ghost small" type="button" data-go="access">Voir les accès</button></div>`;
      else zonePart = `<div class="arrival-zone-status"><strong>Zone non validée</strong><button class="btn primary" type="button" id="validateArrivalZoneBtn">✓ Valider ${esc(zone.name)}</button></div>`;
    }
    wrap.innerHTML = `<section class="paper-card journey-card arrival-card"><div class="journey-head"><div><div class="section-kicker">Destination atteinte</div><h2>Arrivée à ${esc(trip.to)}</h2></div><span class="journey-badge">Arrivée</span></div><p class="journey-progress-note">📍 Eleanore est maintenant à <strong>${esc(trip.to)}</strong>. Tu peux valider la zone puis préparer le trajet suivant.</p><div class="arrival-zone-box"><div class="section-kicker">Validation de la zone</div>${zonePart}</div></section>`;
    $('validateArrivalZoneBtn')?.addEventListener('click', validateArrivalZone);
  }
}

function renderEncounterCombatCompletion(){
  const wrap = $('encounterCombatCompletion');
  if (!wrap) return;
  const e = state.encounter;
  const trip = state.activeTravel;
  if (!e?.combatStarted || !e.combatEnemyIds?.length) { wrap.innerHTML = ''; return; }
  const resolved = e.combatEnemyIds.every((id) => {
    const enemy = state.combat.enemies.find((item) => item.id === id);
    return !enemy || enemy.defeated;
  });
  if (!resolved) {
    wrap.innerHTML = `<section class="paper-card combat-arrival-card"><div class="section-kicker">Rencontre de trajet</div><p class="body-copy">Le trajet vers <strong>${esc(trip?.to || 'la destination')}</strong> sera terminé quand ces ennemis seront vaincus.</p></section>`;
    return;
  }
  wrap.innerHTML = `<section class="paper-card combat-arrival-card"><div class="section-kicker">Rencontre terminée</div><h2>La route est libre</h2><p class="body-copy">Le combat de la rencontre est résolu. Eleanore peut maintenant arriver à <strong>${esc(trip?.to || 'sa destination')}</strong>.</p><button class="btn primary full" type="button" id="finishCombatEncounterBtn">✓ Terminer la rencontre et arriver</button></section>`;
  $('finishCombatEncounterBtn')?.addEventListener('click', () => finishEncounter('Rencontre terminée après le combat.'));
}

function renderHome(){
  $('homeName').textContent = state.character.name;
  $('homeClass').textContent = `${state.character.className} · Niveau ${state.character.level}`;
  $('homePo').textContent = state.po;
  $('homeQuest').textContent = state.character.quest || 'Aucune quête IRL définie';
  $('homeQuestMeta').textContent = state.character.special ? `Capacité : ${state.character.special}` : 'Objectif d’aventure personnel';
  $('homePosition').textContent = state.currentLocation || 'Position inconnue';
  const trip = state.activeTravel;
  $('homeTravelStatus').textContent = trip?.status === 'in_progress' ? `En route vers ${trip.to} · effort IRL à terminer` : trip?.status === 'encounter' ? `Vers ${trip.to} · rencontre en cours` : 'Prête à repartir';

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
  const scoutBonus = !!$('travelScoutBonus')?.checked;
  const baseDuration = effortDistance * 5;
  const duration = scoutBonus ? baseDuration / 2 : baseDuration;
  return { gameDistance, effortDistance, duration, baseDuration, scoutBonus };
}

function fmtNumber(value){ return Number.isInteger(value) ? String(value) : Number(value).toLocaleString('fr-FR',{maximumFractionDigits:2}); }

function updateTravelCalculation(){
  if (!$('travelDistance')) return null;
  const calc = travelMath();
  $('travelEffortDistance').textContent = `${fmtNumber(calc.effortDistance)} km`;
  $('travelCalculatedTime').textContent = `${fmtNumber(calc.duration)} min`;
  const encounterCount = Math.floor(calc.gameDistance / 6);
  if ($('travelEncounterCount')) $('travelEncounterCount').textContent = String(encounterCount);
  return { ...calc, encounterCount };
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
  const trip = state.activeTravel;
  const locked = !!trip && ['in_progress','encounter'].includes(trip.status);
  $('travelCurrentPosition').textContent = state.currentLocation || 'Position inconnue';
  $('travelPositionHint').textContent = trip?.status === 'in_progress' ? `En route vers ${trip.to}` : trip?.status === 'encounter' ? `Rencontre avant l’arrivée à ${trip.to}` : 'Point de départ du prochain trajet';
  $('zoneNames').innerHTML = [...state.zones].sort((a,b) => a.name.localeCompare(b.name,'fr')).map((zone) => `<option value="${esc(zone.name)}"></option>`).join('');
  $('travelFrom').value = locked ? trip.from : (state.currentLocation || '');
  if (locked) {
    $('travelTo').value = trip.to;
    $('travelDistance').value = trip.gameDistance;
    $('travelScoutBonus').checked = !!trip.scoutBonus;
    $('travelSolo').checked = !!trip.solo;
  } else {
    $('travelScoutBonus').checked = false;
  }
  $('travelTo').disabled = locked;
  $('travelDistance').disabled = locked;
  $('travelScoutBonus').disabled = locked;
  $('travelSolo').disabled = locked;
  $('saveTravelBtn').disabled = locked;
  $('travelPlannerCard').classList.toggle('is-locked', locked);
  updateTravelCalculation();
  const t = state.lastTravel;
  $('lastTravel').innerHTML = t ? `Dernier trajet : <strong>${esc(t.from || '?')} → ${esc(t.to || '?')}</strong>${t.gameDistance != null ? ` · ${fmtNumber(t.gameDistance)} km` : ''}` : '';
  renderJourneyCard();
  renderTravelConsumables();
}

function renderTravelConsumables(){
  const items = state.equipment.filter((item) => item.consumable);
  const wrap = $('travelConsumables');
  const card = $('travelConsumablesCard');
  card.style.display = items.length ? '' : 'none';
  wrap.innerHTML = items.map((item) => `<button class="chip-btn" type="button" data-action="use-equipment" data-id="${item.id}">${esc(item.name)} ×${item.qty}</button>`).join('');
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
  renderEncounterCombatCompletion();
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
  const pending = items.filter((item) => !item.checked);
  const obtained = items.filter((item) => item.checked);
  const renderItems = (group) => group.length ? group.map((item) => `
    <div class="check-item">
      <label><input type="checkbox" data-action="toggle-access" data-id="${item.id}" ${item.checked ? 'checked' : ''}/><span>${esc(item.name)}</span></label>
      ${item.builtIn ? '' : `<button class="icon-delete" type="button" data-action="delete-access" data-id="${item.id}" aria-label="Supprimer">✕</button>`}
    </div>`).join('') : '<div class="empty-state compact">Aucun.</div>';
  list.innerHTML = `
    <section class="paper-card access-group status-group">
      <div class="group-heading"><div><div class="section-kicker">Accès restreints</div><h2 class="group-title">Accès obtenus</h2><p class="helper">Accès restreints déjà débloqués.</p></div><strong class="access-count">${obtained.length}</strong></div>
      <div class="check-list">${renderItems(obtained)}</div>
    </section>
    <section class="paper-card access-group status-group">
      <div class="group-heading"><div><div class="section-kicker">Accès restreints</div><h2 class="group-title">À obtenir</h2><p class="helper">Accès restreints encore verrouillés.</p></div><strong class="access-count">${pending.length}</strong></div>
      <div class="check-list">${renderItems(pending)}</div>
    </section>`;
}

function renderZones(){
  const list = $('zonesList');
  const collator = new Intl.Collator('fr', { sensitivity:'base' });
  const zones = [...state.zones].sort((a,b) => collator.compare(a.name,b.name));
  const pending = zones.filter((zone) => !zone.validated);
  const validated = zones.filter((zone) => zone.validated);
  const renderZoneItems = (group) => group.length ? group.map((zone) => {
    const access = zone.requiresAccess ? state.accesses.find((item) => item.name === (zone.accessName || zone.name)) : null;
    const unlocked = !zone.requiresAccess || !!access?.checked;
    return `<div class="check-item zone-item ${unlocked ? '' : 'locked'}">
      <label><input type="checkbox" data-action="toggle-zone" data-id="${zone.id}" ${zone.validated ? 'checked' : ''} ${unlocked ? '' : 'disabled'}/><span>${esc(zone.name)}</span>${zone.requiresAccess ? `<span class="zone-lock ${unlocked ? 'unlocked' : ''}">${unlocked ? '🔓 accès obtenu' : '🔒 accès requis'}</span>` : ''}</label>
      ${zone.builtIn ? '' : `<button class="icon-delete" type="button" data-action="delete-zone" data-id="${zone.id}" aria-label="Supprimer">✕</button>`}
    </div>`;
  }).join('') : '<div class="empty-state compact">Aucune.</div>';
  list.innerHTML = `
    <section class="paper-card access-group status-group">
      <div class="group-heading"><div><div class="section-kicker">Zones</div><h2 class="group-title">Zones validées</h2><p class="helper">Zones déjà terminées.</p></div><strong class="access-count">${validated.length}</strong></div>
      <div class="check-list">${renderZoneItems(validated)}</div>
    </section>
    <section class="paper-card access-group status-group">
      <div class="group-heading"><div><div class="section-kicker">Zones</div><h2 class="group-title">À valider</h2><p class="helper">Zones qu’il reste à terminer.</p></div><strong class="access-count">${pending.length}</strong></div>
      <div class="check-list">${renderZoneItems(pending)}</div>
    </section>`;
}

function renderScenario(){
  const list = $('scenarioList');
  const canonOrder = new Map(CANON_SCENARIO.map((entry,index) => [entry.canonicalKey,index]));
  const entries = [...state.scenario].sort((a,b) => {
    if (a.builtIn && b.builtIn) return (canonOrder.get(a.canonicalKey) ?? 999) - (canonOrder.get(b.canonicalKey) ?? 999);
    if (a.builtIn) return -1; if (b.builtIn) return 1;
    return new Date(a.at || 0) - new Date(b.at || 0);
  });
  const pitchHtml = `<article class="scenario-card scenario-pitch"><div class="section-kicker">Pitch de départ</div><h2>Le Disque-Fonte est menacé</h2><p>${esc(SCENARIO_PITCH)}</p></article><div class="scenario-separator">Chronologie de campagne</div>`;
  list.innerHTML = pitchHtml + (entries.length ? entries.map((entry) => {
    if (editingScenarioId === entry.id) {
      return `
        <article class="scenario-card scenario-editing" data-scenario-card="${entry.id}">
          <div class="stack scenario-edit-form">
            <label>Titre<input data-scenario-edit-title value="${esc(entry.title || '')}" /></label>
            <label>Texte<textarea data-scenario-edit-text rows="7">${esc(entry.text || '')}</textarea></label>
            <div class="button-row">
              <button class="btn primary small" type="button" data-action="save-scenario-edit" data-id="${entry.id}">Enregistrer</button>
              <button class="btn ghost small" type="button" data-action="cancel-scenario-edit" data-id="${entry.id}">Annuler</button>
            </div>
          </div>
        </article>`;
    }
    return `
      <article class="scenario-card ${entry.builtIn ? 'canon' : ''}">
        <div class="item-row">
          <h2>${esc(entry.title || 'Passage découvert')}</h2>
          <div class="scenario-card-actions">
            <button class="icon-edit" type="button" data-action="edit-scenario" data-id="${entry.id}" aria-label="Modifier ce passage" title="Modifier">✎</button>
            ${entry.builtIn ? '' : `<button class="icon-delete" type="button" data-action="delete-scenario" data-id="${entry.id}" aria-label="Supprimer">✕</button>`}
          </div>
        </div>
        <p>${esc(entry.text)}</p>
        ${entry.builtIn ? '<div class="scenario-date">Scénario de campagne</div>' : `<div class="scenario-date">${esc(formatDate(entry.at))}</div>`}
      </article>`;
  }).join('') : '<div class="paper-card empty-state">Le scénario se remplira au fur et à mesure de ce que tu découvres.</div>');
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
  renderEncounter();
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
  if (state.activeTravel && ['in_progress','encounter'].includes(state.activeTravel.status)) return toast('Un trajet est déjà en cours');
  const calc = updateTravelCalculation() || travelMath();
  const from = (state.currentLocation || $('travelFrom').value || '').trim();
  const to = $('travelTo').value.trim();
  if (!from) return toast('Indique d’abord la position actuelle');
  if (!to) return toast('Choisis une destination');
  if (from.toLocaleLowerCase('fr') === to.toLocaleLowerCase('fr')) return toast('La destination doit être différente du départ');
  if (calc.gameDistance <= 0) return toast('Indique une distance supérieure à 0');
  const travel = {
    id: uid(), from, to,
    gameDistance: calc.gameDistance, effortDistance: calc.effortDistance, duration: calc.duration, baseDuration: calc.baseDuration, encounterCount: calc.encounterCount,
    scoutBonus: calc.scoutBonus, solo: $('travelSolo').checked, status:'in_progress', startedAt:new Date().toISOString(), encounterCompleted:false
  };
  state.activeTravel = travel;
  state.lastTravel = { ...travel };
  state.encounter = freshEncounterState();
  logEvent(`Trajet enregistré : ${travel.from} → ${travel.to} · ${fmtNumber(travel.gameDistance)} km · ${fmtNumber(travel.duration)} min d’effort${travel.scoutBonus ? ' (bonus Éclaireur ×½)' : ''}.`);
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

let diceRolling = false;

function sleep(ms){
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function animateDice({ container, button, count, sides = 6, rolls, rollingText = '🎲 Ça roule…' }){
  if (diceRolling) return false;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  diceRolling = true;
  if (button) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.classList.add('is-rolling');
    button.textContent = rollingText;
  }
  container.setAttribute('aria-busy', 'true');
  if (reduceMotion) {
    container.innerHTML = rolls.map((roll) => `<div class="die">${roll}</div>`).join('');
  } else {
    container.innerHTML = Array.from({ length: count }, (_, index) => `<div class="die rolling" style="--die-delay:${index * 45}ms">${secureDie(sides)}</div>`).join('');
    const dice = Array.from(container.querySelectorAll('.die'));
    const ticker = setInterval(() => {
      dice.forEach((die) => { if (die.classList.contains('rolling')) die.textContent = secureDie(sides); });
    }, 70);
    await sleep(480);
    for (let index = 0; index < dice.length; index += 1) {
      const die = dice[index];
      die.textContent = rolls[index];
      die.classList.remove('rolling');
      die.classList.add('landed');
      await sleep(count > 2 ? 70 : 110);
    }
    clearInterval(ticker);
  }
  container.removeAttribute('aria-busy');
  if (button) {
    button.disabled = false;
    button.classList.remove('is-rolling');
    button.textContent = button.dataset.originalText || '🎲 Lancer';
    delete button.dataset.originalText;
  }
  diceRolling = false;
  return true;
}

function encounterDefinition(){
  return state.encounter?.resultNumber ? ENCOUNTER_TABLE[state.encounter.resultNumber] : null;
}

function resetEncounter({ render = true } = {}){
  state.encounter = freshEncounterState();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  if (render) renderEncounter();
}

function renderEncounter(){
  const e = state.encounter || (state.encounter = freshEncounterState());
  const def = encounterDefinition();
  const typeDice = $('encounterTypeDice');
  if (!typeDice) return;
  const trip = state.activeTravel;
  const context = $('encounterTravelContext');
  if (context) context.innerHTML = trip?.status === 'encounter' ? `<div class="section-kicker">Trajet en cours</div><strong>${esc(trip.from)} → ${esc(trip.to)}</strong><p class="helper">L’effort IRL est validé. L’arrivée sera enregistrée quand cette rencontre sera terminée.</p>` : '';

  typeDice.innerHTML = e.typeRolls?.length ? e.typeRolls.map((roll) => `<div class="die">${roll}</div>`).join('') : '';
  $('encounterTypeTotal').textContent = e.total ? `Total : ${e.total}` : '';

  const resultSlot = $('encounterResultCard');
  if (!def) {
    resultSlot.innerHTML = '<div class="empty-state compact">Lance 7D6 : le total désignera automatiquement la rencontre.</div>';
  } else {
    const effect = def.effect && def.effect !== 'NA' ? `<div class="encounter-effect"><span>Effet immédiat</span><strong>${esc(def.effect)}</strong></div>` : '';
    resultSlot.innerHTML = `
      <article class="encounter-result-card">
        <div class="encounter-result-top"><div><div class="section-kicker">Résultat ${e.resultNumber}</div><h2>${esc(def.name)}</h2></div><span class="encounter-number">${e.resultNumber}</span></div>
        <div class="encounter-meta">
          <div class="zone-meta"><span>Zone</span><strong>${esc(def.zones)}</strong></div>
          ${def.hp == null ? '' : `<div><span>PV</span><strong>${def.hp}</strong></div>`}
          ${def.reward == null ? '' : `<div><span>Récomp.</span><strong>${def.reward} PO</strong></div>`}
        </div>
        ${effect}
        ${e.zoneConfirmed ? '<div class="zone-confirmed">✓ Zone confirmée</div>' : `<div class="zone-choice"><p>Vérifie la zone indiquée ci-dessus.</p><div class="button-row"><button class="btn primary" type="button" id="confirmEncounterZoneBtn">✓ La zone correspond</button><button class="btn ghost" type="button" id="passEncounterZoneBtn">↷ Mauvaise zone : passer</button></div></div>`}
      </article>`;
    $('confirmEncounterZoneBtn')?.addEventListener('click', confirmEncounterZone);
    $('passEncounterZoneBtn')?.addEventListener('click', passEncounterForZone);
  }

  const quantityButton = $('rollEncounterQuantityBtn');
  const quantityStep = $('encounterStepQuantity');
  const quantityDice = $('encounterQuantityDice');
  const quantityResult = $('encounterQuantityResult');
  quantityDice.innerHTML = e.quantityRaw ? `<div class="die">${e.quantityRaw}</div>` : '';

  const readyForQuantity = Boolean(def && e.zoneConfirmed);
  quantityStep.classList.toggle('locked-step', !readyForQuantity);
  if (!readyForQuantity) {
    quantityButton.disabled = true;
    $('quantityHelper').textContent = 'Détermine d’abord la rencontre et confirme que sa zone correspond.';
    quantityResult.innerHTML = '';
  } else if (def.skipQuantity) {
    quantityButton.disabled = true;
    $('quantityHelper').textContent = 'Cette rencontre indique de ne pas lancer le dé de quantité.';
    quantityResult.innerHTML = '<div class="rule-result"><strong>Quantité : 1</strong><span>Pas de jet de quantité.</span></div>';
  } else {
    quantityButton.disabled = false;
    $('quantityHelper').textContent = 'Lance 1D6. Le trajet solo divise ensuite la quantité par 2, arrondie au supérieur.';
    if (e.quantityRaw) {
      let chain = `${e.quantityRaw}`;
      if (def.quantityMultiplier) chain += ` × ${def.quantityMultiplier} = ${e.quantityBeforeSolo}`;
      const solo = state.activeTravel?.status === 'encounter' ? !!state.activeTravel.solo : !!$('travelSolo')?.checked;
      if (solo) chain += ` → solo : ${e.quantityFinal}`;
      quantityResult.innerHTML = `<div class="rule-result"><strong>Quantité finale : ${e.quantityFinal}</strong><span>${esc(chain)}</span></div>`;
    } else quantityResult.innerHTML = '';
  }

  const quantityResolved = readyForQuantity && (def.skipQuantity || Boolean(e.quantityRaw));
  const contextStep = $('encounterStepContext');
  const contextButton = $('rollEncounterContextBtn');
  contextStep.classList.toggle('locked-step', !quantityResolved);
  contextButton.disabled = !quantityResolved;
  $('contextHelper').textContent = quantityResolved ? (def.contextBonus ? `Lance 1D6. ${def.name} ajoute +${def.contextBonus} au résultat (maximum 6 pour cette table).` : 'Lance 1D6 pour établir le contexte de la rencontre.') : 'Détermine d’abord la quantité.';
  $('encounterContextDice').innerHTML = e.contextRaw ? `<div class="die">${e.contextRaw}</div>` : '';
  if (e.contextFinal) {
    const ctx = ENCOUNTER_CONTEXTS[e.contextFinal];
    const bonusText = def.contextBonus ? `<span>Dé ${e.contextRaw} + ${def.contextBonus} → résultat ${e.contextFinal}</span>` : '';
    $('encounterContextResult').innerHTML = `<div class="context-result"><div><span>Contexte</span><strong>${esc(ctx.context)}</strong></div><div><span>Exercice / malus</span><strong>${esc(ctx.exercise)}</strong></div>${bonusText}</div>`;
  } else $('encounterContextResult').innerHTML = '';

  const finalCard = $('encounterFinalCard');
  const finalActions = $('encounterFinalActions');
  if (def && e.zoneConfirmed && quantityResolved && e.contextFinal) {
    finalCard.hidden = false;
    const actions = [];
    if (e.combatStarted) {
      actions.push('<button class="btn primary" type="button" id="returnEncounterCombatBtn">⚔ Reprendre le combat</button>');
    } else {
      if (e.contextFinal === 6) actions.push('<button class="btn ghost" type="button" id="avoidEncounterBtn">👀 Éviter la rencontre</button>');
      if (def.kind === 'merchant') actions.push('<button class="btn primary" type="button" id="openEncounterMerchantBtn">🏕️ Ouvrir l’échoppe</button>');
      if (def.hp != null && def.hp > 0) actions.push('<button class="btn primary" type="button" id="sendAutoEncounterCombatBtn">⚔ Envoyer au combat</button>');
      actions.push('<button class="btn ghost" type="button" id="finishEncounterBtn">✓ Terminer la rencontre</button>');
    }
    finalActions.innerHTML = actions.join('');
    $('returnEncounterCombatBtn')?.addEventListener('click', () => go('combat'));
    $('avoidEncounterBtn')?.addEventListener('click', () => finishEncounter('Rencontre évitée grâce au contexte.'));
    $('openEncounterMerchantBtn')?.addEventListener('click', () => {
      if (state.activeTravel?.status === 'encounter') completeActiveTravelArrival(`Rencontre : ${def.name}. Marchand rencontré.`, 'merchant');
      else { logEvent(`Rencontre : ${def.name}. Marchand ouvert.`); resetEncounter({render:false}); persist(); go('merchant'); }
    });
    $('sendAutoEncounterCombatBtn')?.addEventListener('click', sendAutoEncounterToCombat);
    $('finishEncounterBtn')?.addEventListener('click', () => finishEncounter(`Rencontre terminée : ${def.name}.`));
  } else {
    finalCard.hidden = true;
    finalActions.innerHTML = '';
  }
}

async function rollEncounterType(){
  if (diceRolling) return;
  const travelId = state.activeTravel?.status === 'encounter' ? state.activeTravel.id : null;
  resetEncounter({ render:false });
  state.encounter.travelId = travelId;
  const rolls = Array.from({ length:7 }, () => secureDie(6));
  await animateDice({ container:$('encounterTypeDice'), button:$('rollEncounterTypeBtn'), count:7, sides:6, rolls, rollingText:'🎲 Les 7 dés roulent…' });
  const total = rolls.reduce((a,b) => a+b, 0);
  state.encounter.typeRolls = rolls;
  state.encounter.total = total;
  state.encounter.resultNumber = total;
  const def = ENCOUNTER_TABLE[total];
  logEvent(`Jet de rencontre : ${rolls.join(' + ')} = ${total} → ${def.name}. Zone : ${def.zones}.`);
  persist(null,{render:false});
  renderEncounter();
}

function confirmEncounterZone(){
  if (!encounterDefinition()) return;
  state.encounter.zoneConfirmed = true;
  const def = encounterDefinition();
  if (def.skipQuantity) {
    state.encounter.quantityRaw = null;
    state.encounter.quantityBeforeSolo = 1;
    state.encounter.quantityFinal = 1;
  }
  persist(null,{render:false});
  renderEncounter();
}

function passEncounterForZone(){
  const def = encounterDefinition();
  const message = def ? `Rencontre ignorée : ${def.name} n’est pas accessible dans la zone actuelle.` : 'Rencontre passée.';
  if (state.activeTravel?.status === 'encounter') {
    completeActiveTravelArrival(message);
    return;
  }
  logEvent(message);
  resetEncounter({render:false});
  persist('Rencontre passée');
  go('travel');
}

async function rollEncounterQuantity(){
  const def = encounterDefinition();
  if (!def || !state.encounter.zoneConfirmed || def.skipQuantity || diceRolling) return;
  const raw = secureDie(6);
  await animateDice({ container:$('encounterQuantityDice'), button:$('rollEncounterQuantityBtn'), count:1, sides:6, rolls:[raw], rollingText:'🎲 Quantité…' });
  const beforeSolo = raw * (def.quantityMultiplier || 1);
  const solo = state.activeTravel?.status === 'encounter' ? !!state.activeTravel.solo : !!$('travelSolo')?.checked;
  const finalQty = solo ? Math.ceil(beforeSolo / 2) : beforeSolo;
  state.encounter.quantityRaw = raw;
  state.encounter.quantityBeforeSolo = beforeSolo;
  state.encounter.quantityFinal = finalQty;
  persist(null,{render:false});
  renderEncounter();
}

async function rollEncounterContext(){
  const def = encounterDefinition();
  if (!def || !state.encounter.zoneConfirmed || diceRolling) return;
  const quantityResolved = def.skipQuantity || Boolean(state.encounter.quantityRaw);
  if (!quantityResolved) return;
  const raw = secureDie(6);
  await animateDice({ container:$('encounterContextDice'), button:$('rollEncounterContextBtn'), count:1, sides:6, rolls:[raw], rollingText:'🎲 Contexte…' });
  const finalResult = Math.min(6, raw + (def.contextBonus || 0));
  state.encounter.contextRaw = raw;
  state.encounter.contextFinal = finalResult;
  const ctx = ENCOUNTER_CONTEXTS[finalResult];
  logEvent(`Contexte de ${def.name} : ${ctx.context} — ${ctx.exercise}`);
  persist(null,{render:false});
  renderEncounter();
}

function sendAutoEncounterToCombat(){
  const def = encounterDefinition();
  if (!def || def.hp == null || def.hp <= 0) return;
  const count = def.skipQuantity ? 1 : Math.max(1, Number(state.encounter.quantityFinal) || 1);
  const ids = addEnemyInstances(def.name, count, def.hp, Math.max(0, Number(def.reward) || 0), { encounterEnemy:true });
  state.encounter.combatStarted = true;
  state.encounter.combatEnemyIds = ids;
  logEvent(`Rencontre de trajet : ${count} ${def.name}${count > 1 ? 's' : ''} envoyé${count > 1 ? 's' : ''} au combat.`);
  persist('Rencontre envoyée au combat');
  go('combat');
}

function finishEncounter(message){
  if (state.activeTravel?.status === 'encounter') {
    completeActiveTravelArrival(message || 'Rencontre terminée.');
    return;
  }
  if (message) logEvent(message);
  resetEncounter({render:false});
  persist('Rencontre terminée');
  go('travel');
}

function addEnemyInstances(name, count, hp, reward, meta = {}){
  const ids = [];
  for (let i = 1; i <= count; i += 1) {
    const id = uid();
    ids.push(id);
    state.combat.enemies.push({
      id, name: count > 1 ? `${name} ${i}` : name,
      maxHp: hp, hp, reward, defeated: false, rewarded: false, ...meta
    });
  }
  return ids;
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
  if (action === 'edit-scenario') { editingScenarioId = id; renderScenario(); }
  if (action === 'cancel-scenario-edit') { editingScenarioId = null; renderScenario(); }
  if (action === 'save-scenario-edit') {
    const entry = state.scenario.find((item) => item.id === id);
    const card = actionButton.closest('[data-scenario-card]');
    if (!entry || !card) return;
    const title = card.querySelector('[data-scenario-edit-title]')?.value.trim() || '';
    const text = card.querySelector('[data-scenario-edit-text]')?.value.trim() || '';
    if (!text) { toast('Le texte du passage ne peut pas être vide'); return; }
    entry.title = title;
    entry.text = text;
    editingScenarioId = null;
    persist('Passage modifié');
  }
  if (action === 'delete-scenario') { state.scenario = state.scenario.filter((item) => item.id !== id || item.builtIn); if (editingScenarioId === id) editingScenarioId = null; persist(); }
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


let deferredInstallPrompt = null;

function isStandaloneApp(){
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function updateInstallCard(){
  const card = $('installAppCard');
  const btn = $('installAppBtn');
  const hint = $('installHint');
  if (!card || !btn || !hint) return;
  if (isStandaloneApp()) { card.hidden = true; return; }
  card.hidden = false;
  if (deferredInstallPrompt) {
    btn.disabled = false;
    hint.textContent = 'Ajoute le JDR à ton écran d’accueil pour l’ouvrir comme une application.';
  } else {
    btn.disabled = false;
    hint.textContent = 'Sur Android, Chrome peut proposer l’installation directement ou depuis son menu.';
  }
}

async function installApp(){
  if (!deferredInstallPrompt) {
    toast('Dans Chrome : menu ⋮ → Installer l’application / Ajouter à l’écran d’accueil');
    return;
  }
  deferredInstallPrompt.prompt();
  try { await deferredInstallPrompt.userChoice; } catch {}
  deferredInstallPrompt = null;
  updateInstallCard();
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  updateInstallCard();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  updateInstallCard();
  toast('Fitland est installé !');
});

function bindEvents(){
  document.addEventListener('click', handleDelegatedClick);
  document.addEventListener('change', handleDelegatedChange);
  $('installAppBtn')?.addEventListener('click', installApp);
  $('editHomePositionBtn')?.addEventListener('click', editCurrentLocation);
  $('editTravelPositionBtn')?.addEventListener('click', editCurrentLocation);

  ['charName','charClass','charLevel','charPath','charQuest','charSpecial'].forEach((id) => $(id).addEventListener('input', saveCharacterFromInputs));
  $('adjustPoBtn').addEventListener('click', () => openNumberModal({ title:'Ajuster la bourse', label:'Ajouter ou retirer des poids d’or (ex. 50 ou -20)', value:0, confirmText:'Modifier', onConfirm:(delta) => { state.po = Math.max(0, state.po + delta); logEvent(`${delta >= 0 ? '+' : ''}${delta} PO. Solde : ${state.po} PO.`); persist('PO mis à jour'); } }));
  $('addEquipmentBtn').addEventListener('click', addEquipment);
  $('saveTravelBtn').addEventListener('click', saveTravel);
  $('travelDistance').addEventListener('input', updateTravelCalculation);
  $('travelScoutBonus').addEventListener('change', updateTravelCalculation);
  $('rollEncounterTypeBtn').addEventListener('click', rollEncounterType);
  $('rollEncounterQuantityBtn').addEventListener('click', rollEncounterQuantity);
  $('rollEncounterContextBtn').addEventListener('click', rollEncounterContext);
  $('resetEncounterBtn').addEventListener('click', () => resetEncounter());
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
  updateInstallCard();
  requestPersistentStorage();
  go(state.ui.lastView || 'home');
}

document.addEventListener('DOMContentLoaded', init);
