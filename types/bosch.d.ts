type DeviceType = 'TemperatureLevel' | 'ValveTappet' | 'RoomClimateControl' | 'ShutterContact'

interface BaseService {
  '@type': 'DeviceServiceData'
  id: DeviceType
  deviceId: string
  state: object
  path: string
}

interface TemperatureLevelService extends BaseService {
  id: 'TemperatureLevel'
  state: {
    '@type': 'temperatureLevelState'
    'temperature': number
  }
}

interface ValveTappetService extends BaseService {
  id: 'ValveTappet'
  'state': {
    '@type': 'valveTappetState'
    'value': string
    'position': number
  }
}

interface RoomClimateControlService extends BaseService {
  id: 'RoomClimateControl'
  'state': {
    '@type': 'climateControlState'
    setpointTemperature: number
  }
}

interface ShutterContact extends BaseService {
  id: 'ShutterContact'
  state: {
    '@type': 'shutterContactState'
    'value': 'CLOSED' | 'OPEN'
  }
}

type Service = TemperatureLevelService | ValveTappetService | RoomClimateControlService | ShutterContact

interface Device {
  '@type': string
  'rootDeviceId': string
  'id': string
  'roomId': string
  'name': string
}

interface Room {
  '@type': 'device'
  'id': string
  'name': string
  'roomId'
}

type PollId = string
