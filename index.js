const boschClient = require('./lib/boschClient')
const fs = require('fs')
const util = require('util')
const appendFile = util.promisify(fs.appendFile)
const { influx } = require('./lib/influx')
const eventTransformer = require('./lib/eventTransform')

let pollId = 'null'

async function longPoll (rooms, devices) {
  console.log('setting up poll')
  pollId = await boschClient.setupPoll()
  const {
    pollEventToInfluxEvent
  } = eventTransformer(devices, rooms)

  while (true) {
    const events = await boschClient.longPoll(pollId)
    console.log(`events: ${JSON.stringify(events)}`)

    await appendFile('event.log', `${JSON.stringify({
      time: new Date(),
      events
    })}\n`)

    const points = events.flatMap(pollEventToInfluxEvent)

    if (points.length > 0) {
      await influx.writePoints(points)
      console.log(`written to influx ${JSON.stringify(points)}`)
    }
  }
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
 *
 * @param {Room[]} rooms
 * @param {Device[]}devices
 * @return {Promise<void>}
 */
async function fetchDeviceState (rooms, devices) {
  const deviceServicesToInfluxEvents = eventTransformer(devices, rooms).deviceServicesToInfluxEvents
  for (const device of devices) {
    const services = await boschClient.fetchDeviceServices(device.id)
    const points = deviceServicesToInfluxEvents(device.id, services)
    if (points.length > 0) {
      influx.writePoints(points)
    }
    console.log(`initial state to influx: ${JSON.stringify(points)}`)
  }
}

async function main () {
  try {
    const { rooms, devices } = await refreshData()
    console.log(`Devices: ${JSON.stringify(devices)}`)
    try {
      await fetchDeviceState(rooms, devices)
      const fiveMinutes = 5 * 60 * 1000
      setInterval(async function () {
        try {
          await fetchDeviceState(rooms, devices)
        } catch (e) {
          console.error(`Failed to fetch device state: ${e}`)
        }
      }, fiveMinutes)
      await longPoll(rooms, devices)
    } catch (e) {
      console.error(e)
    } finally {
      await unsubscribe()
    }
  } catch (e) {
    console.log(`Failed to fetch devices: ${e}`)
  }
}

main()
