(() => {
  function log(...args) {
    console.log('[waiting-gfx]', ...args);
  }

  // 🔧 mets ici le namespace exact de ton module waiting-matches
  const namespace = 'module-waiting-matches';

  function logoUrl(logo) {
    if (!logo) return '';

    // si c'est déjà une URL absolue / ou un chemin serveur, on le garde tel quel
    if (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/')) {
      return logo;
    }

    // sinon, c'est un filename (ex: "Team Logo.png")
    let decoded = logo;
    try { decoded = decodeURIComponent(logo); } catch {}
    const encoded = encodeURIComponent(decoded);

    return `/pages/op-module-teams/img/${encoded}`;
  }

  function safeText(v) {
    return (v ?? '').toString();
  }

  function makeRow(match) {
    const blue = match?.teams?.blueTeam ?? {};
    const red  = match?.teams?.redTeam ?? {};

    const showScore = !!match?.showScore;
    const midLabel = showScore
      ? `${Number(blue.score ?? 0)}-${Number(red.score ?? 0)}`
      : 'VS';

    const row = document.createElement('div');
    row.className = 'match';

    const logoL = document.createElement('img');
    logoL.className = 'match__logo match__logo--left';
    logoL.alt = '';
    logoL.src = logoUrl(blue.logo);
    logoL.onerror = () => console.warn('[waiting-gfx] logo left 404:', logoL.src, 'raw=', blue.logo);

    const logoR = document.createElement('img');
    logoR.className = 'match__logo match__logo--right';
    logoR.alt = '';
    logoR.src = logoUrl(red.logo);
    logoR.onerror = () => console.warn('[waiting-gfx] logo right 404:', logoR.src, 'raw=', red.logo);

    const center = document.createElement('div');
    center.className = 'match__center';

    const nameL = document.createElement('div');
    nameL.className = 'match__name match__name--left';
    nameL.textContent = safeText(blue.name || blue.tag);

    const mid = document.createElement('div');
    mid.className = 'match__mid';
    mid.textContent = midLabel;

    const nameR = document.createElement('div');
    nameR.className = 'match__name match__name--right';
    nameR.textContent = safeText(red.name || red.tag);

    center.appendChild(nameL);
    center.appendChild(mid);
    center.appendChild(nameR);

    row.appendChild(logoL);
    row.appendChild(center);
    row.appendChild(logoR);

    return row;
  }

  function render(matches) {
    const root = document.getElementById('matches');
    if (!root) {
      log('ERROR: #matches not found in DOM');
      return;
    }

    const list = (Array.isArray(matches) ? matches : []).slice(0, 7);
    log('render() matches length:', list.length);

    root.innerHTML = '';

    const filtered = list.filter((m) => {
      const b = m?.teams?.blueTeam ?? {};
      const r = m?.teams?.redTeam ?? {};
      return (b.name || b.tag || b.logo) || (r.name || r.tag || r.logo);
    });

    if (filtered.length === 0) {
      // Placeholder visible (no data)
      const empty = document.createElement('div');
      empty.style.opacity = '0.65';
      empty.style.fontWeight = '700';
      empty.textContent = '';
      root.appendChild(empty);
      return;
    }

    filtered.forEach((m) => root.appendChild(makeRow(m)));
  }

  function wireLiveUpdates() {
    // ✅ update live via LPTE (multi-navigateurs)
    window.LPTE.on(namespace, 'update', (data) => {
      log('LPTE update received');
      render(data?.matches || []);
    });
  }

  async function init() {
    log('init, href=', window.location.href);
    log('origin=', window.location.origin);

    // ✅ 1) récupère l’état au chargement
    const data = await window.LPTE.request({
      meta: { namespace, type: 'request-current', version: 1 }
    });

    render(data?.matches || []);

    // ✅ 2) écoute les updates live
    wireLiveUpdates();
  }

  // Dom ready béton + LPTE ready
  function boot() {
    window.LPTE.onready(() => {
      init().catch((e) => console.error('[waiting-gfx] init error', e));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();