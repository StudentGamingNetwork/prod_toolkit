const namespace = 'module-teams'

const teamsContainer = document.querySelectorAll('.team')
const blueScore = document.getElementById('blue-score')
const blueName = document.querySelector('#blue-name')
const redScore = document.getElementById('red-score')
const redName = document.querySelector('#red-name')
const pointContainer = document.querySelector('#point-container')
const blueLogo = document.querySelector('#blue-logo')
const redLogo = document.querySelector('#red-logo')
const draft = document.getElementById("draft_iframe")
// const score = document.querySelector('.score')

const server =  window.constants.getWebServerPort()
const apiKey =  window.constants.getApiKey()

const location_draft = `http://${server}/pages/op-module-league-champselect-ui/champselect.html`
draft.src = `${location_draft}${apiKey !== null ? '?apikey=' + apiKey : ''}`

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
  } else {
    teamsContainer.forEach((t) => {
      t.style.display = 'none'
    })
  }
}

const update = (data) => {
  if (data.state === 'READY') {
    displayTeams(data.teams, data.bestOf)
  } else {
    teamsContainer.forEach((t) => {
      t.style.display = 'none'
    })
  }
}

window.LPTE.onready(() => {
  tick()
  window.LPTE.on(namespace, 'update', update)
})

function updatePips(bestOf, team, score){
  const pips = document.querySelectorAll(`#${team}-pips .pip`);
  pipblue_div = document.querySelector(`#blue-pips`)
  pipred_div = document.querySelector(`#red-pips`)

  pips.forEach((pip, i) => {
    if (bestOf > 1){
      pipblue_div.style.diplay = 'flex'
      pipred_div.style.diplay = 'flex'
      if (i < score) {
        pip.classList.add("filled");
      } else {
        pip.classList.remove("filled");
      }
    } else {
      pipblue_div.style.display = 'none'
      pipred_div.style.display = 'none'
    }
    });
}

function displayTeams(teams, bestOf) {
  teamsContainer.forEach((t) => {
    t.style.display = 'flex'
  })

  blueName.innerHTML = teams.blueTeam.name
  blueScore.innerHTML = teams.blueTeam.score
  updatePips(bestOf, "blue", teams.blueTeam.score)
  blueLogo.src = "../img/" + teams.blueTeam.logo
  // resizeText(blueName)

  redName.innerHTML = teams.redTeam.name
  redScore.innerHTML = teams.redTeam.score
  updatePips(bestOf, "red", teams.redTeam.score)
  redLogo.src = "../img/" + teams.redTeam.logo
  // resizeText(redName)

  redName.classList.remove('outline')
  blueName.classList.remove('outline')

  if (bestOf > 1) {
    blueScore.style.display = 'block'
    redScore.style.display = 'block'
  } else {
    blueScore.style.display = 'none'
    redScore.style.display = 'none'
  }
}

const isOverflown = ({ clientWidth, scrollWidth }) => scrollWidth > clientWidth

const resizeText = (parent) => {
  let i = 20 // let's start with 12px
  let overflow = false
  const maxSize = 25 // very huge text size

  while (!overflow && i < maxSize) {
    parent.style.fontSize = `${i}px`
    overflow = isOverflown(parent)
    if (!overflow) i++
  }

  // revert to last state where no overflow happened:
  parent.style.fontSize = `${i - 1}px`
}

function displayPoints(bestOf, blueTeam, redTeam) {
  const pointsToWin = Math.ceil(bestOf / 2)
  for (let i = 0; i < 5; i++) {
    const point = i + 1

    const setTeamPoints = (teamName, teamData) => {
      const selector = document.getElementById(`point-${teamName}-${point}`)
      if (teamData.score >= point) {
        // Point scored, make visible
        selector.style.display = 'block'
        // selector.style.visibility = 'unset'
        selector.classList.remove('empty')
      } else {
        // is this point possible to make?
        if (point > pointsToWin) {
          // no, completely not display
          selector.style.display = 'none'
          // selector.style.visibility = 'unset'
          selector.classList.remove('empty')
        } else {
          // yes, only soft hide
          // selector.style.visibility = 'hidden'
          selector.style.display = 'block'
          selector.classList.add('empty')
        }
      }
    }

    setTeamPoints('blue', blueTeam)
    setTeamPoints('red', redTeam)
  }
}
