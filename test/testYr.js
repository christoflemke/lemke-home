const client = require('../lib/yr/yrClient')
const nock = require('nock')
const config = require('../lib/config').yr
const { expect } = require('chai')
const { yrForcastToIPoints } = require('../lib/yr/yrEventMapper')
const { readFixture } = require('./helpers/readFixture')

nock.disableNetConnect()
describe('yr', function () {
  describe('client', function () {
    /**
     * @param {object} [opts]
     * @param {number} [opts.times]
     * @param {Date} [opts.expires]
     * @param {number} [opts.status]
     * @param {any} [opts.body]
     * @return {import('nock').Scope}
     */
    function mockResponse ({
      times = 1,
      expires = new Date(),
      status = 200,
      body = { foo: 'bar' }
    } = {}) {
      return nock('https://api.met.no', {
        reqheaders: {
          'User-Agent': 'https://github.com/christoflemke/lemke-home',
          Accept: 'application/json'
        }
      })
        .get('/weatherapi/locationforecast/2.0/compact')
        .query({
          lat: config.lat,
          altitude: config.altitude,
          lon: config.lon
        })
        .times(times)
        .reply(status, body, {
          expires: expires.toUTCString(),
          'last-modified': 'Sat, 12 Mar 2022 14:01:46 GMT'
        })
    }

    beforeEach(client.clearCache)

    it('fetches the weather forecast', async function () {
      const scope = mockResponse()

      const response = await client.getForecastCached()

      expect(response).to.eql({ foo: 'bar' })
      scope.done()
    })

    it('will return cached data', async function () {
      const scope = mockResponse({
        expires: new Date(new Date().getTime() + 60 * 1000)
      })

      await client.getForecastCached()
      const response = await client.getForecastCached()

      expect(response).to.eql({ foo: 'bar' })
      scope.done()
    })

    it('will refetch if data is outdated', async function () {
      const scope = mockResponse({
        times: 2,
        expires: new Date(new Date().getTime() - 60 * 1000)
      })

      await client.getForecastCached()
      const response = await client.getForecastCached()

      expect(response).to.eql({ foo: 'bar' })
      scope.done()
    })

    it('will still use the cached state if the service responds with 304', async function () {
      const scope1 = mockResponse({
        expires: new Date(new Date().getTime() - 60 * 1000)
      })
      await client.getForecastCached()
      const scope2 = mockResponse({
        expires: new Date(new Date().getTime() - 60 * 1000),
        status: 304,
        body: ''
      })
      const response = await client.getForecastCached()

      expect(response).to.eql({ foo: 'bar' })
      scope1.done()
      scope2.done()
    })
  })

  describe('event mapper', function () {
    const points = yrForcastToIPoints(readFixture('yrCompact'))
    function findMeasure (name) {
      return points.find(p => p.measurement === name)?.fields?.value
    }
    it('maps air_pressure_at_sea_level', function () {
      expect(findMeasure('air_pressure_at_sea_level')).to.eql(1022.1)
    })

    it('maps air_temperature', function () {
      expect(findMeasure('air_temperature')).to.eql(7.1)
    })

    it('maps cloud_area_fraction', function () {
      expect(findMeasure('cloud_area_fraction')).to.eql(0.2)
    })

    it('maps relative_humidity', function () {
      expect(findMeasure('relative_humidity')).to.eql(43.1)
    })

    it('maps wind_from_direction', function () {
      expect(findMeasure('wind_from_direction')).to.eql(144.1)
    })

    it('maps wind_speed', function () {
      expect(findMeasure('wind_speed')).to.eql(7.7)
    })
  })
})
