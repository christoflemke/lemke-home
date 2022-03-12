const axios = require('axios').default
const https = require('https')
const config = require('getconfig').bosch

const axiosOptions = {
  headers: {
    'Content-Type': 'application/json',
    'api-version': '2.1'
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    cert: Buffer.from(config.clientCert, 'base64').toString(),
    key: Buffer.from(config.clientKey, 'base64').toString()
  })
}
const baseUrl = config.baseUrl
const remoteJsonRpcUrl = `${baseUrl}/remote/json-rpc`

async function setupPoll () {
  const response = await axios.post(
    remoteJsonRpcUrl,
    [
      {
        jsonrpc: '2.0',
        method: 'RE/subscribe',
        params: [
          'com/bosch/sh/remote/*',
          null
        ]
      }
    ],
    axiosOptions
  )
  const pollId = response.data[0].result
  console.log(`Fetched poll id: ${pollId}`)
  return pollId
}

async function longPoll (pollId) {
  const response = await axios.post(
    remoteJsonRpcUrl,
    [
      {
        jsonrpc: '2.0',
        method: 'RE/longPoll',
        params: [
          pollId,
          30
        ]
      }
    ],
    axiosOptions
  )
  return response.data[0].result
}

async function unsubscribe (pollId) {
  const response = await axios.post(remoteJsonRpcUrl,
    [
      {
        jsonrpc: '2.0',
        method: 'RE/unsubscribe',
        params: [
          pollId
        ]
      }
    ],
    axiosOptions
  )
  return response.data
}

/**
 * @return {Promise<Device[]>}
 */
async function fetchDevices () {
  const response = await axios.get(`${baseUrl}/smarthome/devices`, axiosOptions)
  return response.data
}

/**
 * @return {Promise<Room[]>}
 */
async function fetchRooms () {
  const response = await axios.get(`${baseUrl}/smarthome/rooms`, axiosOptions)
  return response.data
}

/**
 * @param {string} deviceId
 * @return {Promise<Service[]>}
 */
async function fetchDeviceServices (deviceId) {
  const response = await axios.get(`${baseUrl}/smarthome/devices/${deviceId}/services`, axiosOptions)
  return response.data
}

async function fetchServices () {
  const response = await axios.get(`${baseUrl}/smarthome/services`, axiosOptions)
  return response.data
}

module.exports = {
  longPoll,
  unsubscribe,
  setupPoll,
  fetchDevices,
  fetchRooms,
  fetchDeviceServices,
  fetchServices
}
