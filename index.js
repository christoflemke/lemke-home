const { update: boschUpdate } = require('./lib/bosch/updater')
const { update: airthingsUpdate } = require('./lib/airthings/airthingsUpdater')

boschUpdate()
airthingsUpdate()