const config = require('getconfig').airthings
const axios = require('axios').default
const parser = require('./airthingsParser')
const { influx } = require('../influx')

async function auth () {
  const passwordToTokenResponse = await axios.post('https://accounts-api.airthings.com/v1/token', {
    ...config,
    grant_type: 'password',
    client_id: 'accounts'
  }, {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      accept: 'application/json, text/plain, */*'
    }
  })
  console.log('password to token: success')
  const token = passwordToTokenResponse.data.access_token

  const rsp2 = await axios.post(
    'https://accounts-api.airthings.com/v1/authorize?client_id=dashboard&redirect_uri=https%3A%2F%2Fdashboard.airthings.com',
    { scope: ['dashboard'] },
    { headers: { authorization: token } })

  console.log('token to code: success')
  const code = rsp2.data.redirect_uri.split('=')[1]

  const rsp3 = await axios.post('https://accounts-api.airthings.com/v1/token', {
    grant_type: 'authorization_code',
    client_id: 'dashboard',
    client_secret: 'e333140d-4a85-4e3e-8cf2-bd0a6c710aaa',
    code,
    redirect_uri: 'https://dashboard.airthings.com'
  }, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json'
    }
  })

  console.log('auth: success')
  return {
    access_token: rsp3.data.access_token,
    expires_at: new Date(new Date().getTime() + rsp3.data.expires_in * 1000)
  }
}

async function fetchData ({
  access_token
}) {
  const dashboard = await axios.get('https://web-api.airthin.gs/v1/dashboards', {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: access_token
    }
  })
  return dashboard.data
}

async function update () {
  let access_token = null

  const iterate = async function () {
    try {
      if (!access_token) {
        const newAuth = await auth()
        access_token = newAuth.access_token
      }
      const data = await fetchData({
        access_token
      })
      const points = parser.toInfluxEvents(data)
      await influx.writePoints(points)
      console.log(`airthings->influx ${JSON.stringify(points)}`)
    } catch (e) {
      if (e.response.status === 401) {
        console.log('auth failed, deleting token')
        access_token = null
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
