const axios = require('axios').default
const config = require('../config').dmi

const headers = {
  'User-Agents': config.client_id
}

function defaultParams () {
  return {
    'api-key': config.api_key
  }
}

/**
 * @param {Object} [opts]
 * @param {string|null} [opts.bbox]
 * @return {Promise<StationCollection>}
 */
async function getStations({
  bbox = null
} = {}) {
  const params = defaultParams()
  if (bbox) {
    params['bbox'] = bbox
  }
  const response = await axios.get(`${config.metObsApiBaseUrl}/collections/station/items`, {
    headers,
    params
  })
  return response.data
}

/**
 * @param {object} [opts]
 * @param {string|null} [opts.station]
 * @param {string} [opts.period]
 * @param {number} [opts.limit]
 * @return {Promise<ObservationCollection>}
 */
async function getObservations ({
  station = null,
  period = 'latest',
  limit = 100
} = {}) {
  const params = defaultParams()
  if (station) {
    params.stationId = station
    params.period = period
    params.limit = limit
  }
  const response = await axios.get(`${config.metObsApiBaseUrl}/collections/observation/items`, {
    headers,
    params
  })
  return response.data
}


module.exports = {
  getStations,
  getObservations
}