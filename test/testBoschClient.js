const nock = require('nock')
const boschClient = require('../lib/bosch/boschClient')
const expect = require('chai').expect
const baseUrl = 'https://192.168.87.106:8444'
nock.disableNetConnect()
const reqheaders = {
  'Content-Type': 'application/json',
  'api-version': '2.1'
}

describe('boschClient', function () {
  it('sets up polls', async function () {
    const scope = nock(baseUrl)
      .post('/remote/json-rpc', JSON.stringify([
        {
          jsonrpc: '2.0',
          method: 'RE/subscribe',
          params: [
            'com/bosch/sh/remote/*',
            null
          ]
        }
      ]), {
        reqheaders
      })
      .reply(200, [{ result: 123 }])

    const id = await boschClient.setupPoll()

    expect(id).to.eq(123)
    scope.done()
  })

  it('polls events', async function () {
    const scope = nock(baseUrl)
      .post('/remote/json-rpc', [
        {
          jsonrpc: '2.0',
          method: 'RE/longPoll',
          params: [
            123,
            30
          ]
        }
      ], {
        reqheaders
      })
      .reply(200, [{ result: { id: 42 } }])

    const response = await boschClient.longPoll(123)

    expect(response).to.eql({ id: 42 })
    scope.done()
  })

  it('unsubscribes', async function () {
    const scope = nock(baseUrl)
      .post('/remote/json-rpc',
        [
          {
            jsonrpc: '2.0',
            method: 'RE/unsubscribe',
            params: [
              '42'
            ]
          }
        ],
        { reqheaders })
      .reply(
        200, [{ result: 123 }])

    const response = await boschClient.unsubscribe('42')

    expect(response).to.eql([{ result: 123 }])
    scope.done()
  })

  it('fetches devices', async function () {
    const body = [
      {
        '@type': 'device',
        rootDeviceId: '64-da-a0-10-0a-70',
        id: 'roomClimateControl_hz_3',
        deviceServiceIds: [
          'ThermostatSupportedControlMode',
          'TemperatureLevelConfiguration',
          'RoomClimateControl',
          'TemperatureLevel'
        ],
        manufacturer: 'BOSCH',
        roomId: 'hz_3',
        deviceModel: 'ROOM_CLIMATE_CONTROL',
        serial: 'roomClimateControl_hz_3',
        iconId: 'icon_room_basement_rcc',
        name: '-RoomClimateControl-',
        status: 'AVAILABLE',
        childDeviceIds: [
          'hdm:HomeMaticIP:3014F711A000005BB8600763'
        ]
      }]
    const scope = nock(baseUrl)
      .get('/smarthome/devices')
      .reply(200, body)

    const response = await boschClient.fetchDevices()

    expect(response).to.eql(body)
    scope.done()
  })

  it('fetches device services', async function () {
    const body = [
      {
        '@type': 'DeviceServiceData',
        id: 'Linking',
        deviceId: 'hdm:HomeMaticIP:3014F711A000005BB8600768',
        state: {
          '@type': 'linkingState'
        },
        path: '/devices/hdm:HomeMaticIP:3014F711A000005BB8600768/services/Linking'
      },
      {
        '@type': 'DeviceServiceData',
        id: 'SilentMode',
        deviceId: 'hdm:HomeMaticIP:3014F711A000005BB8600768',
        state: {
          '@type': 'silentModeState',
          mode: 'MODE_NORMAL'
        },
        path: '/devices/hdm:HomeMaticIP:3014F711A000005BB8600768/services/SilentMode'
      },
      {
        '@type': 'DeviceServiceData',
        id: 'TemperatureLevel',
        deviceId: 'hdm:HomeMaticIP:3014F711A000005BB8600768',
        state: {
          '@type': 'temperatureLevelState',
          temperature: 23.0
        },
        path: '/devices/hdm:HomeMaticIP:3014F711A000005BB8600768/services/TemperatureLevel'
      },
      {
        '@type': 'DeviceServiceData',
        id: 'ValveTappet',
        deviceId: 'hdm:HomeMaticIP:3014F711A000005BB8600768',
        state: {
          '@type': 'valveTappetState',
          value: 'VALVE_ADAPTION_SUCCESSFUL',
          position: 0
        },
        path: '/devices/hdm:HomeMaticIP:3014F711A000005BB8600768/services/ValveTappet'
      },
      {
        '@type': 'DeviceServiceData',
        id: 'BatteryLevel',
        deviceId: 'hdm:HomeMaticIP:3014F711A000005BB8600768',
        path: '/devices/hdm:HomeMaticIP:3014F711A000005BB8600768/services/BatteryLevel'
      },
      {
        '@type': 'DeviceServiceData',
        id: 'TemperatureOffset',
        deviceId: 'hdm:HomeMaticIP:3014F711A000005BB8600768',
        state: {
          '@type': 'temperatureOffsetState',
          offset: 0.0,
          stepSize: 0.1,
          minOffset: -3.5,
          maxOffset: 3.5
        },
        path: '/devices/hdm:HomeMaticIP:3014F711A000005BB8600768/services/TemperatureOffset'
      },
      {
        '@type': 'DeviceServiceData',
        id: 'Thermostat',
        deviceId: 'hdm:HomeMaticIP:3014F711A000005BB8600768',
        state: {
          '@type': 'childLockState',
          childLock: 'OFF'
        },
        path: '/devices/hdm:HomeMaticIP:3014F711A000005BB8600768/services/Thermostat'
      }
    ]
    const scope = nock(baseUrl)
      .get('/smarthome/devices/hdm:HomeMaticIP:3014F711A000005BB8600768/services')
      .reply(200, body)

    const response = await boschClient.fetchDeviceServices('hdm:HomeMaticIP:3014F711A000005BB8600768')

    expect(response).to.eql(body)
    scope.done()
  })
})
