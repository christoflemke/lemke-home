/**
 * @param {Tile} t
 * @return {SensorValueWithRoom[]}
 */
function tileToSensorValues (t) {
  if (t.type === 'device') {
    return t.content.currentSensorValues.map(v => {
      return {
        ...v,
        roomName: t.content.roomName
      }
    })
  } else {
    return []
  }
}

/**
 * @param {SensorValueWithRoom} s
 * @return {import("influx").IPoint}
 */
function sensorValueToIPoint (s) {
  return {
    measurement: s.type,
    fields: {
      value: s.value
    },
    tags: {
      room: s.roomName
    }
  }
}

module.exports = {
  /**
   * @param {DashboardData} dashboardData
   * @return {import("influx").IPoint[]}
   */
  toInfluxEvents: function (dashboardData) {
    const tiles = dashboardData.currentDashboard.tiles
    const sensorValues = tiles.flatMap(tileToSensorValues)
    return sensorValues.map(sensorValueToIPoint)
  }
}
