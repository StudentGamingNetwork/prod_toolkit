const namespace = 'module-teams'

const tagContainer = document.querySelector('#tag-container')
const blueTag = document.querySelector('#blue-tag')
const redTag = document.querySelector('#red-tag')

const pointContainer = document.querySelector('#point-container')
const nameContainer = document.querySelector('#name-container')
const blueName = document.querySelector('#blue-name')
const redName = document.querySelector('#red-name')

const blueLogo = document.querySelector('#logo-blue')
const redLogo = document.querySelector('#logo-red')

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

function displayTeams(teams, bestOf) {
  tagContainer.style.display = 'flex'
  pointContainer.style.display = 'flex'

  if (bestOf > 1) {
    document.body.classList.add('has-scores')
    pointContainer.style.display = 'flex'
  } else {
    document.body.classList.remove('has-scores')
    pointContainer.style.display = 'none'
  }
  nameContainer.style.display = 'flex'


  // Set point visibility if required
  const pointsToWin = Math.ceil(bestOf / 2)
  const Png = document.getElementById('staticSB')
  if (pointsToWin > 1) {
    Png.src = "./img/ui_bo.png"
  }else{
    Png.src = "./img/ui.png"
  }
  for (let i = 0; i < 5; i++) {
    const point = i + 1

    const setTeamPoints = (teamName, teamData) => {
      const selector = document.getElementById(`point-${teamName}-${point}`)
      if (teamData.score >= point) {
        // Point scored, make visible
        selector.style.display = 'flex'
        selector.style.backgroundColor = '#F5241B'
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
          selector.style.display = 'flex'
          selector.style.backgroundColor = "#992B25"
          selector.classList.add('empty')
        }
      }
    }

    setTeamPoints('blue', teams.blueTeam)
    setTeamPoints('red', teams.redTeam)
  }

  if (teams.blueTeam.color !== '#000000') {
    document
      .querySelector('.module-teams-ingameBU-gfx')
      .style.setProperty('--blue-team', '#ffffff')
  } else {
    document
      .querySelector('.module-teams-ingameBU-gfx')
      .style.removeProperty('--blue-team')
  }
  if (teams.redTeam.color !== '#000000') {
    document
      .querySelector('.module-teams-ingameBU-gfx')
      .style.setProperty('--red-team', '#ffffff')
  } else {
    document
      .querySelector('.module-teams-ingameBU-gfx')
      .style.removeProperty('--red-team')
  }

  blueTag.innerHTML = teams.blueTeam.tag
  redTag.innerHTML = teams.redTeam.tag
  blueLogo.src = '../img/' + teams.redTeam.logo
  redLogo.src = '../img/' + teams.blueTeam.logo
}

const isOverflown = ({ clientWidth, scrollWidth }) => scrollWidth > clientWidth

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
