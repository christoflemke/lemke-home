const boschClient = require('./boschClient')
const fs = require('fs')
const util = require('util')
const appendFile = util.promisify(fs.appendFile)
const { influx } = require('../influx')
const eventTransformer = require('../bosch/eventTransform')

let pollId = 'null'

/**
 * @param {function(Service): import("influx").IPoint[]} serviceToPoints
 * @return {Promise<void>}
 */
async function longPoll (serviceToPoints) {
  let retries = 3
  while (retries > 0) {
    console.log('setting up poll')
    retries--
    pollId = await boschClient.setupPoll()

    try {
      while (true) {
        const events = await boschClient.longPoll(pollId)
        retries = 3
        // console.log(`events: ${JSON.stringify(events)}`)

        await appendFile('event.log', `${JSON.stringify({
          time: new Date(),
          events
        })}\n`)

        const points = events.flatMap(serviceToPoints)

        if (points.length > 0) {
          await influx.writePoints(points)
          console.log(`bosch->influx ${JSON.stringify(points)}`)
        }
      }
    } catch (e) {
      console.log(`Error in long poll ${e}`)
    }
  }
  console.log('No more retries left, giving up')
}

async function unsubscribe () {
  console.log('Unsubscribe')
  const response = await boschClient.unsubscribe(pollId)
  console.log(JSON.stringify(response))
}

process.on('SIGINT', async function () {
  try {
    await unsubscribe()
    console.log('Unsubscribed')
    process.exit(0)
  } catch (e) {
    console.error('Failed to unsubscribe')
    console.error(e)
    process.exit(1)
  }
})

/**
 * @return {Promise<{rooms: Room[], devices: Device[]}>}
 */
async function refreshData () {
  const devices = await boschClient.fetchDevices()
  const rooms = await boschClient.fetchRooms()
  return {
    devices, rooms
  }
}

/**
 * @param {function(Service): import("influx").IPoint[]} serviceToPoints
 * @return {Promise<void>}
 */
async function fetchDeviceState (serviceToPoints) {
  const services = await boschClient.fetchServices()
  // Filter out annotations
  const points = services.flatMap(serviceToPoints).filter(p => p.measurement !== 'ShutterContact')
  if (points.length > 0) {
    await influx.writePoints(points)
    console.log(`scheduled state to influx: ${JSON.stringify(points)}`)
  }
}

async function main () {
  try {
    const { rooms, devices } = await refreshData()
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
        }
      }, fiveMinutes)
      await longPoll(serviceToPoints)
    } catch (e) {
      console.error(e)
    } finally {
      await unsubscribe()
    }
  } catch (e) {
    console.log(`Failed to fetch devices: ${e}`)
  }
}

module.exports = {
  update: main
}
