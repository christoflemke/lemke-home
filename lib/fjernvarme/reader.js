const fs = require('fs')
const readline = require('readline')
const {influx} = require('../influx')

async function linesToPoints(lines) {
  console.log('on close')
  let previous = {
    energyKWh: 0,
    volumeM3: 0,
    energyM3C: 0,
    returnEnergyM3C: 0
  }

  const points = []
  let firstLine = true
  let firstPoint = true

  for (const line of lines) {
    if (firstLine) {
      firstLine = false
      continue
    }
    const [
      _install,
      _gauge,
      _energyType,
      date,
      _comment,
      _comment2,
      _typeCode1,// 1
      energyKWh, // Energi
      _unit1, // 1
      _typeCode2, // 2
      volumeM3, // Volumen
      _unit2, // 1
      _M, // 3
      _N, // Timer
      _O, // 1
      _P, // 4
      _Q, // Fremløbstemperatur
      _R, // 3
      _S, // 5
      _T, // Tilbageløbstemperatur
      _U, // 3
      _V, // 11
      energyM3C, //Fremført energi
      _energyUnit, //1
      _Y, // 12
      returnEnergyM3C, // Returneret energi
      _AA, // 1
      _AB, // 999
      _AC, // Infokode
      _AD, // 3
    ] = line.split(';')
    
    const fields = {
      energyKWh: parseFloat(energyKWh),
      volumeM3: parseFloat(volumeM3),
      energyM3C: parseFloat(energyM3C),
      returnEnergyM3C: parseFloat(returnEnergyM3C)
    }
    
    if (firstPoint) {
      previous = fields
      firstPoint = false
      continue
    }
    
    const point = {
      measurement: 'varmedata3',
      timestamp: new Date(date),
      fields: {
        energyKWh: fields.energyKWh - previous.energyKWh,
        volumeM3: fields.volumeM3 - previous.volumeM3,
        energyM3C: fields.energyM3C - previous.energyM3C,
        returnEnergyM3C: fields.returnEnergyM3C - previous.returnEnergyM3C
      }
    }
    previous = fields
    points.push(point)
  }
  return points
}

module.exports = {
  reader: async (filename) => {
    console.log(`reading file: ${filename}`)
    const lineReader = readline.createInterface({
      input: fs.createReadStream(filename)
    })

    const lines = []
    lineReader.on('line', async (line) => {
      lines.push(line)
    })

    const p = new Promise((resolve, _reject) => {
      lineReader.on('close', () => resolve(''))
    })
    await p
    console.log(`read ${lines.length} lines`)

    const points = await linesToPoints(lines)
    console.log('mapped to points')

    const [ latest ] = await influx.query('select time, energyKWh from varmedata3 order by time desc limit 1')
    //console.log(points[points.length-1])
    const latestTime = new Date(latest.time.getNanoTime()/1000/1000)
    console.log(`Lastest time: ${latestTime}`)
    const newPoints = points.filter(p => {
      return new Date(p.timestamp).getTime() > latestTime.getTime()
    })
    console.log(`Found ${newPoints.length} new measurements`)
    
    await influx.writePoints(newPoints)
    console.log(`File exported: ${filename}`)
  }
}
