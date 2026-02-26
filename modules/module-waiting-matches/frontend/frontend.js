const namespace = 'module-waiting-matches'

// index.js
const TEAMS_DATALIST_ID = 'teams-datalist';
const LOGO_FALLBACK = ''; // ou "img/logo_placeholder.png" si tu veux

/** @type {Array<{name:string, tag?:string, logo?:string}>} */
let teams = [];

/** normalize */
const norm = (s) => (s ?? '').toString().trim().toLowerCase();

function safeLogoPath(logo) {
  if (!logo) return LOGO_FALLBACK;

  // tes logos sont dans /pages/op-module-teams/img/
  // et les filenames peuvent contenir des espaces
  let decoded = logo;
  try { decoded = decodeURIComponent(logo); } catch {}
  const encoded = encodeURIComponent(decoded);

  return `/pages/op-module-teams/img/${encoded}`;
}

function fillDatalist() {
  const dl = document.getElementById(TEAMS_DATALIST_ID);
  if (!dl) {
    console.warn('[waiting-index] datalist not found:', TEAMS_DATALIST_ID);
    return;
  }

  dl.innerHTML = '';
  teams
    .slice()
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t.name || '';
      dl.appendChild(opt);
    });

  console.log('[waiting-index] datalist filled:', teams.length);
}

function findTeamByName(inputValue) {
  const key = norm(inputValue);
  if (!key) return null;

  // match exact d’abord (comme module-teams)
  const exact = teams.find((t) => norm(t.name) === key);
  if (exact) return exact;

  // fallback: contains
  return teams.find((t) => norm(t.name).includes(key)) || null;
}

function wireMatch(idx) {
  const blueName = document.getElementById(`m${idx}-blue-name`);
  const blueTag  = document.getElementById(`m${idx}-blue-tag`);
  const blueLogo = document.getElementById(`m${idx}-blue-logo`);

  const redName = document.getElementById(`m${idx}-red-name`);
  const redTag  = document.getElementById(`m${idx}-red-tag`);
  const redLogo = document.getElementById(`m${idx}-red-logo`);

  const blueScore = document.getElementById(`m${idx}-blue-score`);
  const redScore  = document.getElementById(`m${idx}-red-score`);
  const showScore = document.getElementById(`m${idx}-show-score`);
  const centerLbl = document.getElementById(`m${idx}-center-label`);

  if (!blueName || !redName) {
    console.warn('[waiting-index] missing inputs for match', idx);
    return;
  }

  function refreshCenterLabel() {
    centerLbl.textContent = showScore.checked
      ? `${blueScore.value || 0}-${redScore.value || 0}`
      : 'VS';
  }

  function applyTeam(side, team) {
    if (!team) return;

    if (side === 'blue') {
      if (blueTag) blueTag.value = team.tag || '';
      if (blueLogo) {
        blueLogo.src = safeLogoPath(team.logo);
        blueLogo.dataset.logo = team.logo
        blueLogo.alt = team.name || '';
      }
    } else {
      if (redTag) redTag.value = team.tag || '';
      if (redLogo) {
        redLogo.src = safeLogoPath(team.logo);
        redLogo.dataset.logo = team.logo
        redLogo.alt = team.name || '';
      }
    }
  }

  function onBlueInput() {
    const t = findTeamByName(blueName.value);
    applyTeam('blue', t);
  }
  function onRedInput() {
    const t = findTeamByName(redName.value);
    applyTeam('red', t);
  }

  // IMPORTANT: input (pas change) pour l’autocomplete “live”
  blueName.addEventListener('input', onBlueInput);
  redName.addEventListener('input', onRedInput);

  showScore.addEventListener('change', refreshCenterLabel);
  blueScore.addEventListener('input', refreshCenterLabel);
  redScore.addEventListener('input', refreshCenterLabel);

  refreshCenterLabel();
}

function buildMatchesFromUI() {
  const matches = [];

  for (let i = 0; i < 7; i++) {
    const blueLogoEl = document.getElementById(`m${i}-blue-logo`);
    const redLogoEl  = document.getElementById(`m${i}-red-logo`);

    const blue = {
      name:  document.getElementById(`m${i}-blue-name`).value,
      tag:   document.getElementById(`m${i}-blue-tag`).value,
      logo:  blueLogoEl?.dataset?.logo || '',
      score: Number(document.getElementById(`m${i}-blue-score`).value || 0),
    };

    const red = {
      name:  document.getElementById(`m${i}-red-name`).value,
      tag:   document.getElementById(`m${i}-red-tag`).value,
      logo:  redLogoEl?.dataset?.logo || '',
      score: Number(document.getElementById(`m${i}-red-score`).value || 0),
    };

    const showScore = document.getElementById(`m${i}-show-score`).checked;

    matches.push({
      id: i + 1,
      showScore,
      teams: { blueTeam: blue, redTeam: red }
    });
  }

  return matches;
}

function persistMatches(matches) {
  localStorage.setItem('waiting_matches', JSON.stringify(matches));
  localStorage.setItem('waiting_matches__ping', JSON.stringify({ t: Date.now() }));
  window.dispatchEvent(new Event('waiting_matches_updated'));
}

function unsetMatch(i) {
  document.getElementById(`m${i}-blue-name`).value  = '';
  document.getElementById(`m${i}-blue-tag`).value   = '';
  document.getElementById(`m${i}-blue-score`).value = 0;

  document.getElementById(`m${i}-red-name`).value  = '';
  document.getElementById(`m${i}-red-tag`).value   = '';
  document.getElementById(`m${i}-red-score`).value = 0;

  document.getElementById(`m${i}-show-score`).checked = false;

  const center = document.getElementById(`m${i}-center-label`);
  if (center) center.textContent = 'VS';

  const blueLogo = document.getElementById(`m${i}-blue-logo`);
  const redLogo  = document.getElementById(`m${i}-red-logo`);
  if (blueLogo) { blueLogo.src = ''; delete blueLogo.dataset.logo; }
  if (redLogo)  { redLogo.src  = ''; delete redLogo.dataset.logo; }

  // ✅ persiste immédiatement pour update le GFX sans refresh
  const matches = buildMatchesFromUI();
  persistMatches(matches);

  console.log(`[waiting] unset match ${i + 1}`);
}

function wireUnsetButtons() {
  for (let i = 0; i < 7; i++) {
    const btn = document.getElementById(`m${i}-unset`);
    if (!btn) continue;
    btn.addEventListener('click', () => unsetMatch(i));
  }
}

async function loadTeams() {
  console.log('[waiting-index] requesting teams from module-teams...');
  const data = await window.LPTE.request({
    meta: {
      namespace: 'module-teams',
      type: 'request-teams',
      version: 1
    }
  });

  // format attendu dans l’operator teams: { teams: [...] }
  teams = Array.isArray(data?.teams) ? data.teams : [];
  console.log('[waiting-index] teams loaded:', teams.length);

  fillDatalist();
}

window.LPTE.onready(async () => {
  console.log('[waiting-index] LPTE ready');

  try {
    await loadTeams();

    for (let i = 0; i < 7; i++) wireMatch(i);

    // (optionnel) live update si le module teams push des updates
    window.LPTE.on('module-teams', 'update-teams-set', (evt) => {
      if (!Array.isArray(evt?.teams)) return;
      teams = evt.teams;
      fillDatalist();
    });
  } catch (e) {
    console.error('[waiting-index] ERROR', e);
    alert(`[waiting-index] ERROR: ${e?.message || e}`);
  }
});
function displayData() {
  const raw = localStorage.getItem('waiting_matches');
  if (!raw) return;

  const matches = JSON.parse(raw);

  for (let i = 0; i < 7; i++) {
    const m = matches[i];
    if (!m) continue;

    const blue = m?.teams?.blueTeam || {};
    const red  = m?.teams?.redTeam || {};

    document.getElementById(`m${i}-blue-name`).value  = blue.name  || '';
    document.getElementById(`m${i}-blue-tag`).value   = blue.tag   || '';
    document.getElementById(`m${i}-blue-score`).value = blue.score ?? 0;

    document.getElementById(`m${i}-red-name`).value  = red.name  || '';
    document.getElementById(`m${i}-red-tag`).value   = red.tag   || '';
    document.getElementById(`m${i}-red-score`).value = red.score ?? 0;

    document.getElementById(`m${i}-show-score`).checked = !!m.showScore;

    const center = document.getElementById(`m${i}-center-label`);
    if (center) {
      center.textContent = m.showScore
        ? `${blue.score ?? 0}-${red.score ?? 0}`
        : 'VS';
    }

    if (blue.logo) {
      document.getElementById(`m${i}-blue-logo`).src =
        `/pages/op-module-teams/img/${encodeURIComponent(blue.logo)}`;
    }

    if (red.logo) {
      document.getElementById(`m${i}-red-logo`).src =
        `/pages/op-module-teams/img/${encodeURIComponent(red.logo)}`;
    }
  }
}
function save() {
  const matches = buildMatchesFromUI();

  window.LPTE.emit({
    meta: { namespace, type: 'set', version: 1 },
    matches
  });  
}
async function unset() {
  for (let i = 0; i < 7; i++) {
    document.getElementById(`m${i}-blue-name`).value  = '';
    document.getElementById(`m${i}-blue-tag`).value   = '';
    document.getElementById(`m${i}-blue-score`).value = 0;

    document.getElementById(`m${i}-red-name`).value  = '';
    document.getElementById(`m${i}-red-tag`).value   = '';
    document.getElementById(`m${i}-red-score`).value = 0;

    document.getElementById(`m${i}-show-score`).checked = false;

    const center = document.getElementById(`m${i}-center-label`);
    if (center) center.textContent = 'VS';

    const blueLogo = document.getElementById(`m${i}-blue-logo`);
    const redLogo  = document.getElementById(`m${i}-red-logo`);

    if (blueLogo) {
      blueLogo.src = '';
      delete blueLogo.dataset.logo;
    }

    if (redLogo) {
      redLogo.src = '';
      delete redLogo.dataset.logo;
    }
  }
  window.LPTE.emit({
    meta: { namespace, type: 'unset', version: 1 }
  });
  console.log('[waiting] unset (localStorage cleared)');
}

async function init() {
  const server = await window.constants.getModuleURL()
  const location = server

  const apiKey = await window.constants.getApiKey()

  document.querySelector(
    '#embed-copy'
  ).value = `${location}/waiting-matches-gfx.html${
    apiKey !== null ? '?apikey=' + apiKey : ''
  }`

  const data = await window.LPTE.request({
    meta: {
      namespace,
      type: 'request',
      version: 1
    }
  })

  displayData()
}