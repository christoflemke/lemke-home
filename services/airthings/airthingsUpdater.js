const config = require('../../lib/config').airthings
const parser = require('./airthingsParser')
const {influx} = require('../../lib/influx')

const client = require('./airthingsClient')

async function auth() {
  const token = await client.passwordToToken()
  console.log('password to token: success')

  const code = await client.tokenToCode(token)
  console.log('token to code: success')

  const tokenAuth = await client.codeToToken(code)
  console.log('auth: success')
  return tokenAuth
}

async function update() {
  let accessToken = null

  const iterate = async function () {
    try {
      if (!accessToken) {
        const newAuth = await auth()
        accessToken = newAuth.access_token
      }
      const data = await client.fetchData(accessToken)
      const points = parser.toInfluxEvents(data)
      await influx.writePoints(points)
      console.log(`airthings->influx ${JSON.stringify(points)}`)
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  }
  await iterate()
  setInterval(iterate, config.intervalSeconds * 1000)
}

async function start() {
  try {
    await update()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
start()