const updateUi = async () => {
  const server = await window.constants.getModuleURL()
  const location = `${server}/gfx`

  const apiKey = await window.constants.getApiKey()

  document.querySelector('#gold-embed').value = `${location}/gold.html${
    apiKey !== null ? '?apikey=' + apiKey : ''
  }`

  document.querySelector('#items-embed').value = `${location}/end-of-game.html${
    apiKey !== null ? '?apikey=' + apiKey : ''
  }`

  document.querySelector(
    '#pickban-embed'
  ).value = `${location}/pick-ban-order.html${
    apiKey !== null ? '?apikey=' + apiKey : ''
  }`

  document.querySelector(
    '#all-in-one-embed'
  ).value = `${location}/all-in-one.html${
    apiKey !== null ? '?apikey=' + apiKey : ''
  }`
}

updateUi()

const showItems = () => {
  window.LPTE.emit({
    meta: {
      namespace: 'module-league-end-of-game',
      type: 'end-of-game',
      version: 1
    },
    state: 'ITEMS'
  })
}

const showDmg = () => {
  window.LPTE.emit({
    meta: {
      namespace: 'module-league-end-of-game',
      type: 'end-of-game',
      version: 1
    },
    state: 'DAMAGE'
  })
}
