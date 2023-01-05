const boschService = require('./lib/bosch/updater')
const airthingsService = require('./lib/airthings/airthingsUpdater')
const yrService = require('./lib/yr/updater')
const dmiService = require('./lib/dmi/updater')

const services = [
  boschService,
  airthingsService,
  yrService,
  dmiService
]

for (const service of services) {
  service.start()
}

process.on('SIGINT', async function () {
  for (const service of services) {
    await service.stop()
  }
  process.exit(0)
})