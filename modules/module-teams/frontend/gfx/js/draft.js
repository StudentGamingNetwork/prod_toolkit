const namespace = 'module-teams'

// --- SÉLECTEURS ---
const teamsContainer = document.querySelectorAll('.team')

const blueName = document.querySelector('#blue-name span') || document.querySelector('#blue-name')
const redName = document.querySelector('#red-name span') || document.querySelector('#red-name')

const blueScore = document.getElementById('blue-bo') 
const redScore = document.getElementById('red-bo')   

const blueLogo = document.querySelector('#blue-logo')
const redLogo = document.querySelector('#red-logo')

const blueStanding = document.querySelector('#blue-standing')
const redStanding = document.querySelector('#red-standing')

const draft = document.getElementById("draft_iframe")

// --- CONFIGURATION SERVEUR ---
const server = window.constants.getWebServerPort()
const apiKey = window.constants.getApiKey()

// URL de l'iframe (Module Champselect UI)
const location_draft = `http://${server}/pages/op-module-league-champselect-ui/champselect.html`
draft.src = `${location_draft}${apiKey !== null ? '?apikey=' + apiKey : ''}`


// --- GESTION DES IMAGES BO ---
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


// --- LOGIQUE LPTE ---

const tick = async () => {
  const data = await window.LPTE.request({
    meta: {
      namespace,
      type: 'request-current',
      version: 1
    }
  })

  if (data.state === 'READY') {
    displayTeams(data.teams, data.bestOf)
  }
}

const updateTeams = (data) => {
  if (data.state === 'READY') {
    displayTeams(data.teams, data.bestOf)
  }
}

// Initialisation
window.LPTE.onready(() => {
  // Charge les données initiales
  tick()
  
  // Écoute uniquement les mises à jour d'équipes
  window.LPTE.on(namespace, 'update', updateTeams)
})


// --- FONCTION D'AFFICHAGE ---

function displayTeams(teams, bestOf) {
  teamsContainer.forEach((t) => {
    t.style.display = 'flex'
  })

  // Standings / Scores textuels
  blueStanding.innerText = teams.blueTeam.standing !== undefined ? teams.blueTeam.standing : teams.blueTeam.score + "-" + teams.redTeam.score;
  redStanding.innerText = teams.redTeam.standing !== undefined ? teams.redTeam.standing : teams.redTeam.score + "-" + teams.blueTeam.score;

  // Noms d'équipe : Priorité au TAG, sinon Nom complet
  blueName.innerText = teams.blueTeam.tag || teams.blueTeam.name
  redName.innerText = teams.redTeam.tag || teams.redTeam.name

  // Logos
  blueLogo.src = `http://${server}/pages/op-module-teams/img/${teams.blueTeam.logo}`
  redLogo.src = `http://${server}/pages/op-module-teams/img/${teams.redTeam.logo}`

  // Affichage des carrés de BO (Best Of)
  if (bestOf > 3) {
    blueScore.style.display = 'block'
    redScore.style.display = 'block'
    setBo5Image(blueScore, 'left', teams.blueTeam.score);
    setBo5Image(redScore, 'right', teams.redTeam.score);
  } else if (bestOf > 1) {
    blueScore.style.display = 'block'
    redScore.style.display = 'block'
    setBo3Image(blueScore, 'left', teams.blueTeam.score);
    setBo3Image(redScore, 'right', teams.redTeam.score);

  } else {
    blueScore.style.display = 'none'
    redScore.style.display = 'none'
  }
}