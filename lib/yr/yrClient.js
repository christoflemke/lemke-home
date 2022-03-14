const config = require('../config').yr
const axios = require('axios').default

const axiosOptions = {
  headers: {
    'User-Agent': 'https://github.com/christoflemke/lemke-home',
    Accept: 'application/json'
  }
}

// curl -i -X GET --header 'Accept: application/json' 'https://api.met.no/weatherapi/locationforecast/2.0/compact?altitude=76&lat=56.1689&lon=10.1651'
async function getForecast (headers) {
  const response = await axios.get(`https://api.met.no/weatherapi/locationforecast/2.0/compact?altitude=${config.altitude}&lat=${config.lat}&lon=${config.lon}`, {
    headers: {
      ...axiosOptions.headers,
      ...headers
    }
  })
  return {
    headers: response.headers,
    body: response.data,
    status: response.status
  }
}

let state = null

/**
 *
 * @return {Promise<YrForecast>}
 */
async function getForecastCached () {
  if (state === null) {
    console.log('yr: fetch initial forecast')
    const response = await getForecast()
    if (response.status !== 200) {
      throw new Error('Failed to fetch initial forecast')
    }
    state = response
    return state.body
  }
  if (new Date(state.headers.expires) < new Date()) {
    console.log('yr: update forecast')
    try {
      const response = await getForecast({
        'If-Modified-Since': state.headers['last-modified']
      })
      state = response
    } catch (e) {
      if (e?.response?.status === 304) {
        console.log('yr: forecast not modified')
      } else {
        console.error(e)
      }
    }
  }
  return state.body
}

function clearCache () {
  state = null
}

module.exports = {
  getForecastCached,
  clearCache
}
