const namespace = 'module-teams';
const blueLogo = document.getElementById('blue-logo-big');
const redLogo  = document.getElementById('red-logo-big');

const blueRoot = document.getElementById('ingame-blue');
const redRoot  = document.getElementById('ingame-red');

const blueName = document.getElementById('blue-name');
const redName  = document.getElementById('red-name');

const blueStanding = document.getElementById('blue-standing');
const redStanding  = document.getElementById('red-standing');

const blueBo = document.getElementById('blue-bo'); // <img>
const redBo  = document.getElementById('red-bo');  // <img>

const staticSB = document.getElementById('staticSB');

const tick = async () => {
  const data = await this.LPTE.request({
    meta: {
      namespace,
      type: 'request-current',
      version: 1
    }
  })

  if (data.state === 'READY') {
    displayTeams(data.teams, data.bestOf)
  } else {
    tagContainer.style.display = 'none'
    pointContainer.style.display = 'none'
  }
}

const update = (data) => {
  if (data.state === 'READY') {
    displayTeams(data.teams, data.bestOf)
  } else {
    tagContainer.style.display = 'none'
    pointContainer.style.display = 'none'
  }
}

window.LPTE.onready(() => {
  tick()
  window.LPTE.on(namespace, 'update', update)
})

function setBo3Image(imgEl, side, score) {
  // side = "left" | "right"
  const file = `${side}_${score}.png`;

  // même logique que tes logos: dossier img servi avec la page
  const url = `../img/${file}`;

  imgEl.src = url;

  // debug utile si ça 404
  imgEl.onerror = () => {
    console.warn(`[BO IMG] not found: ${url}`);
    imgEl.onerror = null;
    imgEl.src = `../img/${side}_0.png`; // fallback
  };
}

function setBo5Image(imgEl, side, score) {
  // side = "left" | "right"
  const file = `${side}_${score}3.png`;

  // même logique que tes logos: dossier img servi avec la page
  const url = `../img/${file}`;

  imgEl.src = url;

  // debug utile si ça 404
  imgEl.onerror = () => {
    console.warn(`[BO IMG] not found: ${url}`);
    imgEl.onerror = null;
    imgEl.src = `../img/${side}_0.png`; // fallback
  };
}

function setHasBo(rootEl, hasBo) {
  rootEl.dataset.hasBo = hasBo ? '1' : '0';
}

function displayTeams(teams, bestOf) {
  // Texte
  blueName.textContent = teams.blueTeam?.tag ?? '';
  redName.textContent  = teams.redTeam?.tag ?? '';

  blueStanding.textContent = teams.blueTeam?.standing ?? '';
  redStanding.textContent  = teams.redTeam?.standing ?? '';
  blueLogo.src = "../img/" + teams.blueTeam.logo
  redLogo.src = "../img/" + teams.redTeam.logo
  const hasBo = bestOf > 1;

  setHasBo(blueRoot, hasBo);
  setHasBo(redRoot, hasBo);


  // Images BO
  if (hasBo) {
    if (bestOf > 3) {
      setBo5Image(blueBo, 'left', teams.blueTeam?.score ?? 0);
      setBo5Image(redBo, 'right', teams.redTeam?.score ?? 0);
    }
    else if (bestOf > 1) {
      setBo3Image(blueBo, 'left', teams.blueTeam?.score ?? 0);
      setBo3Image(redBo, 'right', teams.redTeam?.score ?? 0);
    }
  }
}const isOverflown = ({ clientWidth, scrollWidth }) => scrollWidth > clientWidth

const resizeText = (parent) => {
  let i = 15 // let's start with 12px
  let overflow = false
  const maxSize = 23 // very huge text size

  while (!overflow && i < maxSize) {
    parent.style.fontSize = `${i}px`
    overflow = isOverflown(parent)
    if (!overflow) i++
  }

  // revert to last state where no overflow happened:
  parent.style.fontSize = `${i - 1}px`
}
