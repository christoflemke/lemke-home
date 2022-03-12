interface YrPointInTimeForecast {
  time: Date
  data: {
    instant: {
      details: {
        'air_pressure_at_sea_level': number
        'air_temperature': number
        'cloud_area_fraction': number
        'relative_humidity': number
        'wind_from_direction': number
        'wind_speed': number
      }
    }
  }
}

interface YrForecast {
  'type': 'Feature'
  'geometry': {
    'type': 'Point'
    'coordinates': [
      number,
      number,
      number
    ]
  }
  properties: {
    meta: object
    timeseries: YrPointInTimeForecast[]
  }
}
