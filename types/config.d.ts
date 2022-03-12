interface YrConfig {
  'altitude': number
  'lat': number
  'lon': number
  'interval': number
}

interface AirthingsConfig {
  'username': string
  'password': string
  'intervalSeconds': number
}

interface InfluxConfig {
  'host': string
  'username': string
  'password': string
  'port': number
  'database': string
}

interface BoschConfig {
  'clientCert': string
  'clientKey': string
  'baseUrl': string
}

interface DmiConfig {
  "client_id": string,
  "api_key": string,
  "metObsApiBaseUrl": "https://dmigw.govcloud.dk/v2/metObs"
}

interface Configuration {
  yr: YrConfig
  airthings: AirthingsConfig
  influx: InfluxConfig
  bosch: BoschConfig
  dmi: DmiConfig
}
