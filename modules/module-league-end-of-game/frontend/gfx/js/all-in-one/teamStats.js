// TeamStat Div`s
const teamStats = document.getElementById('teamStats')
const kdaDiv = teamStats.querySelector('#kda')
const goldDiv = teamStats.querySelector('#gold')
const towerDiv = teamStats.querySelector('#tower')
const inhibitorsDiv = teamStats.querySelector('#inhibitors')
const drakesDiv = teamStats.querySelector('#drakes')
const eldersDiv = teamStats.querySelector('#elders')
const baronsDiv = teamStats.querySelector('#barons')
const bansDiv = teamStats.querySelector('#bans')


function displayTeamStats(teams) {
  // KDA
  const blueTeamKDA = `${teams[100].stats.kills} / ${teams[100].stats.deaths} / ${teams[100].stats.assists}`
  kdaDiv.querySelector('.stat.blue').innerHTML = blueTeamKDA

  const redTeamKDA = `${teams[200].stats.kills} / ${teams[200].stats.deaths} / ${teams[200].stats.assists}`
  kdaDiv.querySelector('.stat.red').innerHTML = redTeamKDA

  // Gold
  const blueTeamGold = calcK(teams[100].stats.gold)
  goldDiv.querySelector('.stat.blue').innerHTML = blueTeamGold

  const redTeamGold = calcK(teams[200].stats.gold)
  goldDiv.querySelector('.stat.red').innerHTML = redTeamGold

  // Tower
  towerDiv.querySelector('.stat.blue').innerHTML = teams[100].stats.towers
  towerDiv.querySelector('.stat.red').innerHTML = teams[200].stats.towers

  // Drakes
  // displayDrakes(teams)
  setUniqueObjectiveIcon('herald', teams[100].stats.riftHerald, teams[200].stats.riftHerald, './img/herald.png');
  // setUniqueObjectiveIcon('atakhan', teams[100].stats.atakhan, teams[200].stats.atakhan, './img/atakkan.png');
  // Elders
  // eldersDiv.querySelector('.stat.blue.span').innerHTML = teams[100].stats.elders
  // eldersDiv.querySelector('.stat.red').innerHTML = teams[200].stats.elders
  injectIconStat("barons", "blue", "./img/baron.png", teams[100].stats.barons);
  injectIconStat("barons", "red", "./img/baron.png", teams[200].stats.barons);
  injectIconStat("elders", "blue", "./img/elderLarge.png", teams[100].stats.elders);
  injectIconStat("elders", "red", "./img/elderLarge.png", teams[200].stats.elders);
  injectIconStat("horde", "blue", "./img/horde.png", teams[100].stats.horde);
  injectIconStat("horde", "red", "./img/horde.png", teams[200].stats.horde);
  // Barons
  // baronsDiv.querySelector('.stat.blue').innerHTML = teams[100].stats.barons
  // baronsDiv.querySelector('.stat.red').innerHTML = teams[200].stats.barons

  // Bans
  // displayBans(teams)
}

function setUniqueObjectiveIcon(rowId, blueValue, redValue, iconPath) {
  const blueContainer = document.querySelector(`#${rowId} .blue`);
  const redContainer = document.querySelector(`#${rowId} .red`);
  
  blueContainer.innerHTML = '';
  redContainer.innerHTML = '';

  if (blueValue === 1) {
    blueContainer.innerHTML = `<img class="icon" src="${iconPath}" alt="${rowId}">`;
  }

  if (redValue === 1) {
    redContainer.innerHTML = `<img class="icon" src="${iconPath}" alt="${rowId}">`;
  }
}

function injectIconStat(id, team, iconSrc, value) {
  const container = document.querySelector(`#${id} .${team}`);
  if (id === "barons"){
    container.innerHTML = `<img class="icon" src="${iconSrc}" style="width: 25px; height: 25px; margin-right: 10px;"><span>${value}</span>`;
  } else {  
    container.innerHTML = `<img class="icon" src="${iconSrc}"><span>${value}</span>`;
  }
}

function displayDrakes(teams) {
  const blueDrakes = teams[100].dragons
  const redDrakes = teams[200].dragons

  drakesDiv.querySelector('.stat.blue').innerHTML = ''
  for (let i = 0; i < blueDrakes.length; i++) {
    const drake = blueDrakes[blueDrakes.length - 1 - i]
      .split('_')[0]
      .toLowerCase()
    const drakeImg = document.createElement('img')
    drakeImg.classList.add('dragon-icon')
    drakeImg.src = `${staticURL}/img/drakes/${drake}.png`

    drakesDiv.querySelector('.stat.blue').appendChild(drakeImg)
  }

  drakesDiv.querySelector('.stat.red').innerHTML = ''
  for (let i = 0; i < redDrakes.length; i++) {
    const drake = redDrakes[i].split('_')[0].toLowerCase()
    const drakeImg = document.createElement('img')
    drakeImg.classList.add('dragon-icon')
    drakeImg.src = `${staticURL}/img/drakes/${drake}.png`

    drakesDiv.querySelector('.stat.red').appendChild(drakeImg)
  }
}

function displayBans(teams) {
  const blueBans = teams[100].bans
  const redBans = teams[200].bans

  bansDiv.querySelector('.stat.blue').innerHTML = ''
  for (let i = 0; i < blueBans.length; i++) {
    const ban = blueBans[i]
    const banImg = document.createElement('img')
    banImg.classList.add('ban')
    banImg.src = champUrl(ban)

    bansDiv.querySelector('.stat.blue').appendChild(banImg)
  }

  bansDiv.querySelector('.stat.red').innerHTML = ''
  for (let i = 0; i < redBans.length; i++) {
    const ban = redBans[i]
    const banImg = document.createElement('img')
    banImg.classList.add('ban')
    banImg.src = champUrl(ban)

    bansDiv.querySelector('.stat.red').appendChild(banImg)
  }
}

function displayFeat(teamId){
  const blueteamScore = teamId === 100 ? 1 : 0
  const redteamScore = teamId === 200 ? 1 : 0
  const color = teamId === 100 ? "blue" : "red"
  const todisplay = `./img/feat_${color}.png`
  setUniqueObjectiveIcon('feat', blueteamScore, redteamScore, todisplay);
}