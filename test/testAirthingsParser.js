const parser = require('../lib/airthings/airthingsParser')
const fs = require('fs')
const path = require('path')
const { expect } = require('chai')

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'airthings.json')).toString())

describe('airthingsParser', function () {
  const points = parser.toInfluxEvents(fixture)

  function testValue (measurement, room, expected) {
    const roomPoint = points.find(e => e?.tags?.room === room)
    const value = roomPoint && roomPoint.fields && roomPoint.fields[measurement]
    expect(value).to.eql(expected)
  }

  it('maps to one point for each room', function () {
    expect(points.length).to.eql(2)
  })

  it('reports temperature', function () {
    testValue('temp', 'Upstairs', 21.3)
  })

  it('reports radon levels', function () {
    testValue('radonShortTermAvg', 'Upstairs', 108)
  })

  it('reports humidity', function () {
    testValue('humidity', 'Upstairs', 44)
  })

  it('reports voc', function () {
    testValue('voc', 'roof', 390)
  })

  it('reports mold', function () {
    testValue('mold', 'roof', 1)
  })
})
