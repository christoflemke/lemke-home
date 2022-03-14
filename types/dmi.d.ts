interface Geometry {
  coordinates: [
    number, // lon
    number // lat
  ]
  type: 'Point'
}

interface Station {
  geometry: Geometry
  id: string
  properties: {
    name: string
    parameterId: string[]
    status: string
    operationTo: Date
    stationId: string
  }
}

interface StationCollection {
  type: 'FeatureCollection'
  features: Station[]
  numberReturned: number
  links: Array<{
    href: string
    rel: 'self' | 'next'
    title: string
  }>
}

interface ObservationMeasurement {
  created: Date
  observed: Date
  parameterId: string // pressure, temp, etc
  stationId: string
  value: number
}

interface Observation {
  geometry: Geometry
  id: string
  type: 'Feature'
  properties: ObservationMeasurement
}

interface ObservationCollection {
  type: 'FeatureCollection'
  features: Observation[]
}
