const nock = require('nock')
const boschClient = require('../lib/bosch/boschClient')
const expect = require('chai').expect
const baseUrl = 'https://192.168.87.106:8444'
const { readFixture } = require('./helpers/readFixture')
nock.disableNetConnect()
const reqheaders = {
  'Content-Type': 'application/json',
  'api-version': '2.1'
}

describe('boschClient', function () {
  it('/remote/json-rpc RE/subscribe', async function () {
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

  it('/remote/json-rpc RE/longPoll', async function () {
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

  it('/remote/json-rpc RE/unsubscribe', async function () {
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

  it('/smarthome/devices', async function () {
    const body = readFixture('devices')
    const scope = nock(baseUrl)
      .get('/smarthome/devices')
      .reply(200, body)

    const response = await boschClient.fetchDevices()

    expect(response).to.eql(body)
    scope.done()
  })

  it('/smarthome/devices/<deviceId>/services', async function () {
    const body = readFixture('deviceServices')
    const scope = nock(baseUrl)
      .get('/smarthome/devices/hdm:HomeMaticIP:3014F711A000005BB8600768/services')
      .reply(200, body)

    const response = await boschClient.fetchDeviceServices('hdm:HomeMaticIP:3014F711A000005BB8600768')

    expect(response).to.eql(body)
    scope.done()
  })

  it('/smarthome/services', async function () {
    const body = readFixture('servicesArray')
    const scope = nock(baseUrl)
      .get('/smarthome/services')
      .reply(200, body)

    const response = await boschClient.fetchServices()

    expect(response).to.eql(body)
    scope.done()
  })
})
