const axios = require('axios').default

const {influx} = require('../../lib/influx')

const D2IO_URL = 'https://diablo2.io/dclone_api.php'

const REGIONS = {
    1: 'America',
    2: 'Europe ',
    3: 'Asia   '
};

const MODES = {
    1: 'Hardcore',
    2: 'Softcore'
};

const LEAGUES = {
    1: 'Ladder',
    2: 'Non-Ladder'
};

async function update() {
    console.log('Fetching DClone data...')
    const {data} = await axios.get(D2IO_URL)
    console.log(`Fetched ${data.length} entries`)
    const influxPoints = data.map(({progress, region, hc, ladder}) => {
        return {
            measurement: `dclone`,
            tags: {
                region: REGIONS[region] || 'Unknown',
                hardcore: MODES[hc] || 'Unknown',
                ladder: LEAGUES[ladder] || 'Unknown',
            },
            fields: {
                progress: Number(progress) || -1
            },
        }
    })
    console.log(`Writing ${influxPoints.length} points to InfluxDB`)
    await influx.writePoints(influxPoints)
    console.log('Data written successfully')
}

async function start() {
  try {
      await update()
      setInterval(update, 60 * 1000)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

start()
