const namespace = 'module-league-end-of-game'

let blue = getComputedStyle(document.body).getPropertyValue('--blue-team')
let red = getComputedStyle(document.body).getPropertyValue('--red-team')
const white = 'rgba(250,250,250,1)'
const whiteTransparent = 'rgba(250,250,250,0.1)'

async function displayGoldGraph(data) {

  console.log(data)
  const rawData = data.state.goldFrames
  const labels = Object.keys(rawData).map(t => Math.floor(parseInt(t) / 60000));
  const values = Object.values(rawData);

  const dataMin = Math.abs(Math.min(...values));
  const dataMax = Math.abs(Math.max(...values));
  let zero_stop_percent = 100 * dataMax / (dataMax + dataMin)

  const options = {
    chart: {
      type: 'area',
      height: 1000,
      width: 1920,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
    },
    series: [{
      name: 'Gold Diff',
      data: labels.map((x, i) => [x, values[i]])
    }],
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      labels: {
        style: { colors: '#fff' },
        formatter: val => {
          const totalSeconds = Math.round(val * 60);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
      },
      tickAmount: 15,
      axisBorder: {
        show: false
      }
    },
    yaxis: {
      labels: { 
        style: { colors: '#fff' },
        formatter: val => {
          if (Math.abs(val) >= 1000) {
            return (val / 1000).toFixed(1).replace('.0', '') + 'k';
          }
          return val;
        },
      },
      tickAmount: 20, 
      forceNiceScale: true,
      axisTicks: { show: false },
      axisBorder: { show: false },
      crosshairs: {
        show: true,
        position: 'back',
        stroke: {
          color: '#F9B233',
          width: 1,
          dashArray: 3
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3.5,
      colors: ['#F9B233'],
      fill: {
        type: "gradient",
        gradient: {
          type:'diagnonal1',
          colorStops:
              [
                  {
                      offset: 0,
                      color: '#F7EC6C',
                      opacity: 1
                  },
                  {
                      offset: 30,
                      color: "#CB890F",
                      opacity: 0.6
                  },
                  {
                      offset: 75,
                      color: '#FBD745',
                      opacity: 0.6
                  },
                  {
                      offset: 100,
                      color: '#BF6617',
                      opacity: 1
                  }
              ]
      }
      },
    },
    fill: {
      type: "gradient",
      gradient: {
          type:'vertical',
          colorStops:
              [
                  {
                      offset: 0,
                      color: '#2DC6FF',
                      opacity: 1
                  },
                  {
                      offset: zero_stop_percent,
                      color: "#30D5C8",
                      opacity: 0.6
                  },
                  {
                      offset: zero_stop_percent,
                      color: '#FF3366',
                      opacity: 0.6
                  },
                  {
                      offset: 100,
                      color: '#FF3366',
                      opacity: 1
                  }
              ]
      }
  },
  grid: {
    borderColor: 'rgba(255,255,255,0.1)',
    padding: {
      left: 5,
      right: 5,
      top: 0,
      bottom: 0
    }
  },
  tooltip: { enabled: false },
  legend: { show: false },
  animations: {
    enabled: true,
    easing: 'easeinout',
    speed: 1000,
    delay: 1000,
    animateGradually: {
      enabled: false,
      delay: 1000
    },
    dynamicAnimation: {
      enabled: false,
      speed: 350
    }
  }
  };  
  const Chart = new ApexCharts(document.getElementById("goldGraph"), options);
  Chart.render().then(()=>{
    const path = document.querySelector('.apexcharts-series path.apexcharts-line');
    if (path) {
      path.style.animation = 'pulseStroke 5s ease-in-out infinite';
    }
    const fill = document.querySelector('.apexcharts-area');
    if (fill) {
      fill.style.animation = 'areaPulse 8s ease-in-out infinite';
    }
  })
}

function changeColors(e) {
  if (e.teams.blueTeam.color !== '#000000') {
    document
      .querySelector(':root')
      .style.setProperty('--blue-team', e.teams.blueTeam.color)
    blue = e.teams.blueTeam.color
  } else {
    document.querySelector(':root').style.setProperty('--blue-team', blue)
  }
  if (e.teams.redTeam.color !== '#000000') {
    document
      .querySelector(':root')
      .style.setProperty('--red-team', e.teams.redTeam.color)
    red = e.teams.redTeam.color
  } else {
    document.querySelector(':root').style.setProperty('--red-team', red)
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

  if (teams !== undefined) {
    changeColors(teams)
  }

  window.LPTE.on('module-teams', 'update', changeColors)

  const emdOfGameData = await LPTE.request({
    meta: {
      namespace,
      type: 'request',
      version: 1
    }
  })
  displayGoldGraph(emdOfGameData)

  LPTE.on(namespace, 'update', displayGoldGraph)
})

// Helper to calc milliseconds to minutes and seconds
function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000)
  var seconds = ((millis % 60000) / 1000).toFixed(0)
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}

