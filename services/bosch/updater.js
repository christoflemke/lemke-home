const boschClient = require('./boschClient')
// const fs = require('fs')
// const util = require('util')
// const appendFile = util.promisify(fs.appendFile)
const {influx} = require('../../lib/influx')
const eventTransformer = require('./eventTransform')

let pollId = 'null'
let stopPoll = false

/**
 * @param {function(Service): InfluxPoint[]} serviceToPoints
 * @return {Promise<void>}
 */
async function longPoll(serviceToPoints) {
  while (!stopPoll) { // eslint-disable-line
    console.log('setting up poll')
    pollId = await boschClient.setupPoll()


    while (true) {
      const events = await boschClient.longPoll(pollId)
      // console.log(`events: ${JSON.stringify(events)}`)

      // await appendFile('event.log', `${JSON.stringify({
      //   time: new Date(),
      //   events
      // })}\n`)

      const points = events.flatMap(serviceToPoints)

      if (points.length > 0) {
        await influx.writePoints(points)
        console.log(`bosch->influx ${JSON.stringify(points)}`)
      }
    }
  }
  console.log('No more retries left, giving up')
}

/**
 * @return {Promise<void>}
 */
async function stop() {
  console.log('stopping bosch service')
  stopPoll = true
  console.log('Unsubscribe')
  try {
    const response = await boschClient.unsubscribe(pollId)
    console.log(JSON.stringify(response))
    console.log('Unsubscribed')
  } catch (e) {
    console.error('Failed to unsubscribe')
    console.error(e)
  }
}

/**
 * @return {Promise<{rooms: Room[], devices: Device[]}>}
 */
async function refreshData() {
  const devices = await boschClient.fetchDevices()
  const rooms = await boschClient.fetchRooms()
  return {
    devices, rooms
  }
}

/**
 * @param {function(Service): InfluxPoint[]} serviceToPoints
 * @return {Promise<void>}
 */
async function fetchDeviceState(serviceToPoints) {
  const services = await boschClient.fetchServices()
  // Filter out annotations
  const points = services.flatMap(serviceToPoints).filter(p => p.measurement !== 'bosch_ShutterAnnotation')
  if (points.length > 0) {
    await influx.writePoints(points)
    console.log(`scheduled state to influx: ${JSON.stringify(points)}`)
  }
}

async function update() {
  console.log('starting bosch service')
  const {rooms, devices} = await refreshData()
  const {
    serviceToPoints
  } = eventTransformer(devices, rooms)
  console.log(`Devices: ${JSON.stringify(devices)}`)
  try {
    await fetchDeviceState(serviceToPoints)
    const fiveMinutes = 5 * 60 * 1000
    setInterval(async function () {
      try {
        await fetchDeviceState(serviceToPoints)
      } catch (e) {
        console.error(`Failed to fetch device state: ${e}`)
        process.exit(1)
      }
    }, fiveMinutes)
    await longPoll(serviceToPoints)
  } finally {
    await stop()
  }
}

async function start() {
  try {
    await update()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

start()

process.on('SIGINT', async function () {
  await stop()
  process.exit(0)
})
