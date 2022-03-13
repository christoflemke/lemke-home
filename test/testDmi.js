const { expect } = require('chai')
const { readFixture } = require('./helpers/readFixture')
const { observationsToPoints } = require('../lib/dmi/dmiEventMapper')

describe('dmi', function () {
  const points = observationsToPoints(readFixture('dmiObservations'))
  describe('event mapper', function () {

    it('maps to a single point', function () {
      expect(points.length).to.eql(1)
    })

    it('maps humidity', function () {
      expect(points[0]?.fields?.humidity).to.eql(74)
    })

    it('maps visib_mean_last10min', function () {
      expect(points[0]?.fields?.visib_mean_last10min).to.eql(24200)
    })

    it('includes lon and lat', function () {
      expect(points[0].tags?.lon).to.eql('10.1353')
      expect(points[0].tags?.lat).to.eql('56.0803')
    })
  })
})