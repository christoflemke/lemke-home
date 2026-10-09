import {getForecastCached} from "./yrClient.ts";
import {yrForcastToIPoints} from "./yrEventMapper.ts";
import {influx } from "../../lib/influx.ts";
import config from "../../lib/config.ts";

async function update () {
  async function iterate () {
    try {
      const response = await getForecastCached()
      const points = yrForcastToIPoints(response)
      if (points.length > 0) {
        console.log(`yr -> influx: ${JSON.stringify(points)}`)
        await influx.writePoints(points)
      }
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  }

  await iterate()
  setInterval(iterate, config.yr.interval)
}
update()