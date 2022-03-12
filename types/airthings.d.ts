interface SensorValue {
  type: 'temp' | 'humidity' | 'voc' | 'mold' | 'radonShortTermAvg'
  'value': number
  'providedUnit': string
  'preferredUnit': string
  'isAlert': boolean
  'thresholds': number[]
}

interface SensorValueWithRoom extends SensorValue {
  roomName: string
}

interface TileContent {
  currentSensorValues: SensorValue[]
  roomName: string
}

interface Tile {
  type: string
  content: TileContent
}

interface DashboardData {
  currentDashboard: {
    tiles: Tile[]
  }
}
