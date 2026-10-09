import axios from "axios";
import https from "https";
import config from "../../lib/config.ts";
import fs from "fs";
import path from 'path';
const __dirname = path.resolve();

function readPem (location) {
  return fs.readFileSync(path.join(__dirname, location), { encoding: 'ascii' }).toString()
}

const axiosOptions = {
  headers: {
    'Content-Type': 'application/json',
    'api-version': '3.14'
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    cert: readPem(config.bosch.clientCertLocation),
    key: readPem(config.bosch.clientKeyLocation)
  })
}
const baseUrl = config.bosch.baseUrl
const remoteJsonRpcUrl = `${baseUrl}/remote/json-rpc`

/**
 * @return {Promise<PollId>}
 */
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

/**
 * @param {PollId} pollId
 * @return {Promise<Service[]>}
 */
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

/**
 * @param {PollId} pollId
 * @return {Promise<any>}
 */
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

/**
 * @return {Promise<Service[]>}
 */
async function fetchServices () {
  const response = await axios.get(`${baseUrl}/smarthome/services`, axiosOptions)
  return response.data
}

export default {
  longPoll,
  unsubscribe,
  setupPoll,
  fetchDevices,
  fetchRooms,
  fetchDeviceServices,
  fetchServices
}
