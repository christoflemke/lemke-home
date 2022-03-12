const eventTransformer = require('../lib/bosch/eventTransform')
const expect = require('chai').expect
const { readFixture } = require('./helpers/readFixture')

describe('eventTransformer.toInfluxEvent', function () {
  const devices = readFixture('devices')
  const rooms = readFixture('rooms')
  const {
    serviceToPoints
  } = eventTransformer(devices, rooms)

  describe('pollEventToInfluxEvent', function () {
    it('maps set temperature events', function () {
      const event = readFixture('setTemperature')

      const [influxEvent] = serviceToPoints(event)

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

      const [influxEvent] = serviceToPoints(event)

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

  describe('deviceServicesToInfluxEvents', function () {
    const servicesFixture = readFixture('servicesArray')
    const points = servicesFixture.flatMap(serviceToPoints)
    /**
     * @param {String} device
     * @param {DeviceType} type
     * @return {*}
     */
    function findPoint (device, type) {
      return points.find(p =>
        p.tags?.deviceId === device &&
        p.measurement === type
      )
    }

    it('maps temperature for zones', function () {
      const temperatureZone = findPoint('roomClimateControl_hz_2', 'TemperatureLevel')

      expect(temperatureZone).to.eql({
        fields: {
          value: 23.4
        },
        measurement: 'TemperatureLevel',
        tags: {
          deviceId: 'roomClimateControl_hz_2',
          name: 'roomClimateControl_hz_2',
          roomName: 'Bad oben'
        }
      })
    })

    it('maps temperature for thermostats', function () {
      const temperatureZone = findPoint('hdm:HomeMaticIP:3014F711A000005BB8600768', 'TemperatureLevel')

      expect(temperatureZone).to.eql({
        fields: {
          value: 23.4
        },
        measurement: 'TemperatureLevel',
        tags: {
          deviceId: 'hdm:HomeMaticIP:3014F711A000005BB8600768',
          name: 'Radiator thermostat 2',
          roomName: 'Bad oben'
        }
      })
    })

    it('maps valve tappet state', function () {
      const tappetState = findPoint('hdm:HomeMaticIP:3014F711A000005BB8600763', 'ValveTappet')

      expect(tappetState).to.eql({
        fields: {
          value: 5
        },
        measurement: 'ValveTappet',
        tags: {
          deviceId: 'hdm:HomeMaticIP:3014F711A000005BB8600763',
          name: 'Radiator thermostat 3 *',
          roomName: 'Treppenhaus'
        }
      })
    })

    it('maps shutter state', function () {
      const shutterState = findPoint('hdm:HomeMaticIP:3014F711A000009D58589716', 'ShutterContact')

      expect(shutterState).to.eql({
        fields: {
          title: 'Window in Bad unten is closed',
          value: 'CLOSED'
        },
        measurement: 'ShutterContact',
        tags: {
          deviceId: 'hdm:HomeMaticIP:3014F711A000009D58589716',
          name: 'Door/window contact',
          roomName: 'Bad unten'
        }
      })
    })

    it('maps set point temperature', function () {
      const setPoint = findPoint('roomClimateControl_hz_3', 'RoomClimateControl')

      expect(setPoint).to.eql({
        fields: {
          value: 21
        },
        measurement: 'RoomClimateControl',
        tags: {
          deviceId: 'roomClimateControl_hz_3',
          name: 'roomClimateControl_hz_3',
          roomName: 'Treppenhaus'
        }
      })
    })
  })
})
