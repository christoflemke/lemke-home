interface BaseService {
  '@type': 'DeviceServiceData'
  deviceId: string
  state: object
  path: string
}

interface TemperatureLevelService extends Service {
  id: 'TemperatureLevel'
  state: {
    '@type': 'temperatureLevelState'
    'temperature': number
  }
}

interface ValveTappetService extends Service {
  id: 'ValveTappet'
  'state': {
    '@type': 'valveTappetState'
    'value': string
    'position': number
  }
}

type Service = TemperatureLevelService | ValveTappetService

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
