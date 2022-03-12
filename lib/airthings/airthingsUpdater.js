const config = require('../config').airthings
const parser = require('./airthingsParser')
const { influx } = require('../influx')

const client = require('./airthingsClient')

async function auth () {
  const token = await client.passwordToToken()
  console.log('password to token: success')

  const code = await client.tokenToCode(token)
  console.log('token to code: success')

  const tokenAuth = await client.codeToToken(code)
  console.log('auth: success')
  return tokenAuth
}

async function update () {
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
      if (e.response.status === 401) {
        console.log('auth failed, deleting token')
        accessToken = null
      } else {
        console.error(e)
      }
    }
  }
  await iterate()
  setInterval(iterate, config.intervalSeconds * 1000)
}

module.exports = {
  update
}
