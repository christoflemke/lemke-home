const parser = require('../lib/airthings/airthingsParser')
const fs = require('fs')
const path = require('path')
const { expect } = require('chai')

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'airthings.json')).toString())

describe('airthingsParser', function () {
  function testValue (measurement, room, expected) {
    const temperature = parser
      .toInfluxEvents(fixture)
      .find(e => e.measurement === measurement && e?.tags?.room === room)

    expect(temperature?.fields?.value).to.eql(expected)
  }

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
