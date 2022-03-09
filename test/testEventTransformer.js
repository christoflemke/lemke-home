const fs = require('fs')
const eventTransformer = require('../lib/eventTransform')
const expect = require('chai').expect
const path = require('path')

function readFixture (name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', `${name}.json`)).toString())
}

describe('eventTransformer.toInfluxEvent', function () {
  const devices = readFixture('devices')
  const rooms = readFixture('rooms')
  const {
    pollEventToInfluxEvent
  } = eventTransformer(devices, rooms)

  it('maps set temperature events', function () {
    const event = readFixture('setTemperature')

    const [influxEvent] = pollEventToInfluxEvent(event)

    expect(influxEvent).to.eql({
      measurement: 'RoomClimateControl',
      tags: {
        deviceId: 'roomClimateControl_hz_1',
        name: 'roomClimateControl_hz_1',
        roomName: 'Bad unten'
      },
      fields: {
        value: 21
      }
    })
  })

  it('maps temperature readings', function () {
    const event = readFixture('measureTemperature2')

    const [influxEvent] = pollEventToInfluxEvent(event)

    expect(influxEvent).to.eql({
      measurement: 'TemperatureLevel',
      tags: {
        deviceId: 'hdm:HomeMaticIP:3014F711A000005BB8600464',
        name: 'Radiator thermostat',
        roomName: 'Bad unten'
      },
      fields: {
        value: 22.6
      }
    })
  })
})
