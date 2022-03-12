const config = require('../config').airthings
const axios = require('axios').default

/**
 * @return {Promise<String>}
 */
async function passwordToToken () {
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
  return passwordToTokenResponse.data.access_token
}

/**
 * @param {String} token
 * @return {Promise<string>}
 */
async function tokenToCode (token) {
  const rsp2 = await axios.post(
    'https://accounts-api.airthings.com/v1/authorize?client_id=dashboard&redirect_uri=https%3A%2F%2Fdashboard.airthings.com',
    { scope: ['dashboard'] },
    { headers: { authorization: token } })

  return rsp2.data.redirect_uri.split('=')[1]
}

/**
 * @param {String} code
 * @return {Promise<{access_token: string, expires_at: Date}>}
 */
async function codeToToken (code) {
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

  return {
    access_token: rsp3.data.access_token,
    expires_at: new Date(new Date().getTime() + rsp3.data.expires_in * 1000)
  }
}

/**
 * @param {String} accessToken
 * @return {Promise<DashboardData>}
 */
async function fetchData (accessToken) {
  const dashboard = await axios.get('https://web-api.airthin.gs/v1/dashboards', {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: accessToken
    }
  })
  return dashboard.data
}

module.exports = {
  passwordToToken,
  tokenToCode,
  codeToToken,
  fetchData
}
