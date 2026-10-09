import config from "../../lib/config.ts";
import axios from "axios";

const axiosOptions = {
  headers: {
    'User-Agent': 'https://github.com/christoflemke/lemke-home',
    Accept: 'application/json'
  }
}

// curl -i -X GET --header 'Accept: application/json' 'https://api.met.no/weatherapi/locationforecast/2.0/compact?altitude=76&lat=56.1689&lon=10.1651'
async function getForecast (headers?: any) {
  const response =
    await axios.get(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?altitude=${config.yr.altitude}&lat=${config.yr.lat}&lon=${config.yr.lon}`, {
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

type StateType = {
  headers: any
  body: YrForecast
  status: number
}

let state: StateType|null = null

/**
 *
 * @return {Promise<YrForecast>}
 */
export async function getForecastCached () {
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
      state = await getForecast({
        'If-Modified-Since': state.headers['last-modified']
      })
    } catch (e) {
      if (e?.response?.status === 304) {
        console.log('yr: forecast not modified')
      } else {
        console.error(e)
      }
    }
  }
  if (state) {
    return state.body
  } else {
    throw new Error("state is null")
  }
}

export function clearCache () {
  state = null
}
