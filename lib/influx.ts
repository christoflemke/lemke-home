import Influx from "influx";
import config from "./config";

export const influx = new Influx.InfluxDB(config.influx)

export async function checkAuth () {
  console.log(await influx.getDatabaseNames())
}

