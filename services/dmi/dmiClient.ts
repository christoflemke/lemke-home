import axios from "axios";
import config from "../../lib/config.ts";

const headers = {
  'User-Agents': config.dmi.client_id
}

function defaultParams (): any {
  return {
    'api-key': config.dmi.api_key
  }
}

async function getStations (bbox: string): Promise<StationCollection> {
  const params = defaultParams()
  if (bbox) {
    params.bbox = bbox
  }
  const response = await axios.get(`${config.dmi.metObsApiBaseUrl}/collections/station/items`, {
    headers,
    params
  })
  return response.data
}

async function getObservations (station: string): Promise<ObservationCollection> {
  const params: any = defaultParams()
  if (station) {
    params.stationId = station
    params.period = 'latest'
    params.limit = 100
  }
  const response = await axios.get(`${config.dmi.metObsApiBaseUrl}/collections/observation/items`, {
    headers,
    params
  })
  return response.data
}

export default {
  getStations,
  getObservations
}
