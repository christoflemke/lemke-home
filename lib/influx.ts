import { InfluxDB } from "influx";
import config from "./config";

export const influx = new InfluxDB(config.influx)

export async function checkAuth () {
  console.log(await influx.getDatabaseNames())
}
