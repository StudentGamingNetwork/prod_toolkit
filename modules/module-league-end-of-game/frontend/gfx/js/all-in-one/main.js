const namespace = 'module-league-end-of-game'
let staticURL = '/serve/module-league-static'
let champions = []

const champUrl = (championId) => {
  const champ = champions.find((c) => {
    return c.key === championId.toString()
  })

  if (champ === undefined) return ''

  return `${staticURL}/img/champion/tiles/${champ.id}_0.jpg`
}

function calcK(amount) {
  switch (true) {
    case amount > 1000:
      return `${(amount / 1000).toFixed(1)} K`
    default:
      return amount
  }
}

function displayData(emdOfGameData) {
  const state = emdOfGameData.state
  console.log(state)
  if (state.status !== 'GAME_LOADED') return

  const teams = state.teams
  displayTeamStats(teams)
  const frames = state.goldFrames
  const timeline = state.eventTimeline
  displayGoldGraph(frames, timeline)

  const participants = state.participants
  displayDamageGraph(participants)
  displayGameTime(state.gameDuration)
  // if ( state?.featTeam ){
  //   displayFeat(state.featTeamId)
  // } else {
  //   const feat = document.getElementById("feat")
  //   feat.style.display = "none"
  // }

}

const themeBlue = document
  .querySelector(':root')
  .style.getPropertyValue('--blue-team')
const themeRed = document
  .querySelector(':root')
  .style.getPropertyValue('--red-team')

function MinSec(sec) {
  var minutes = Math.floor(sec / 60)
  var seconds = (sec % 60)
  return minutes + ':' + seconds 
}


function displayGameTime(gameDuration) {
  document.getElementById('game-time').textContent = MinSec(gameDuration) || '00:00';
}
function updateHeaderFromTeamData(data) {
  if (!data?.teams || !data.teams.blueTeam || !data.teams.redTeam) return;

  const blue = data.teams.blueTeam;
  const red = data.teams.redTeam;

  // Set names & tags
  document.getElementById('blue-name').textContent = blue.name || '';
  document.getElementById('blue-tag').textContent = blue.tag || '';
  document.getElementById('red-name').textContent = red.name || '';
  document.getElementById('red-tag').textContent = red.tag || '';

  // Set logos
  const blueLogo = document.getElementById('logo-blue');
  const redLogo = document.getElementById('logo-red');
  if (blue.logo) blueLogo.src = `/pages/op-module-teams/img/${blue.logo}`;
  if (red.logo) redLogo.src = `/pages/op-module-teams/img/${red.logo}`;

  // Conditionally set scores
  const showScore = data.bestOf && data.bestOf > 1;
  document.getElementById('blue-score').innerHTML = showScore ? blue.score : '';
  document.getElementById('red-score').innerHTML = showScore ? red.score : '';
}
function changeColors(e) {
  if (
    e.teams.blueTeam?.color !== undefined &&
    e.teams.blueTeam?.color !== '#000000'
  ) {
    document
      .querySelector(':root')
      .style.setProperty('--blue-team', e.teams.blueTeam.color)
  } else {
    document.querySelector(':root').style.setProperty('--blue-team', themeBlue)
  }
  if (
    e.teams.redTeam?.color !== undefined &&
    e.teams.redTeam?.color !== '#000000'
  ) {
    document
      .querySelector(':root')
      .style.setProperty('--red-team', e.teams.redTeam.color)
  } else {
    document.querySelector(':root').style.setProperty('--red-team', themeRed)
  }
}

LPTE.onready(async () => {
  const teams = await window.LPTE.request({
    meta: {
      namespace: 'module-teams',
      type: 'request-current',
      version: 1
    }
  })
  updateHeaderFromTeamData(teams)
  console.log(teams)
  window.LPTE.on('module-teams', 'update', updateHeaderFromTeamData)

  const constantsRes = await LPTE.request({
    meta: {
      namespace: 'module-league-static',
      type: 'request-constants',
      version: 1
    }
  })
  const constants = constantsRes.constants
  champions = constants.champions

  const emdOfGameData = await LPTE.request({
    meta: {
      namespace,
      type: 'request',
      version: 1
    }
  })
  displayData(emdOfGameData)

  LPTE.on(namespace, 'update', displayData)

  const leagueState = await LPTE.request({
    meta: {
      namespace: 'module-league-state',
      type: 'request',
      version: 1
    }
  })
  displayPUBOrder(leagueState.state.lcu.champselect.order)

  LPTE.on('module-league-state', 'champselect-update', (e) => {
    displayPUBOrder(e.order)
  })

})
