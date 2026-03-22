const container = document.querySelector('.container')

const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

function setState(e) {
  const state = e.state

  if (state.length <= 0) {
    return
  }

  const chunks = chunk(state, 10)

  chunks.forEach((chunk, i) => {
    const head = document.createElement('h1')
    head.innerText = `Game ${i + 1}:`
    container.append(head)

    const images = document.createElement('div')
    images.classList.add('images')

    chunk.forEach((element) => {
      const img = document.createElement('img')
      img.src = element.tileURL
      images.append(img)
    })

    container.append(images)
  });
}

LPTE.onready(async () => {
  const res = await LPTE.request({
    meta: {
      namespace: 'module-league-fearless',
      type: 'request',
      version: 1
    }
  })

  console.log(res)

  setState(res)
})
