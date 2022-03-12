const fs = require('fs')
const path = require('path')
module.exports = {
  readFixture: function (fixtureName) {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', `${fixtureName}.json`)).toString())
  }
}
