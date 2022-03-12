const { update: boschUpdate } = require('./lib/bosch/updater')
const { update: airthingsUpdate } = require('./lib/airthings/airthingsUpdater')
const { update: yrUpdate } = require('./lib/yr/updater')

boschUpdate()
airthingsUpdate()
yrUpdate()