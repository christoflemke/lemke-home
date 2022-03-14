/**
 * @param {SensorValue[]} sensorValues
 * @param {string} room
 * @return {import("influx").IPoint}
 */
function mapRoomValues (sensorValues, room) {
  const fields = {}
  for (const sv of sensorValues) {
    fields[sv.type] = sv.value
  }
  return {
    measurement: 'airthings.sensorValues',
    tags: {
      room
    },
    fields
  }
}

module.exports = {
  /**
   * @param {DashboardData} dashboardData
   * @return {import("influx").IPoint[]}
   */
  toInfluxEvents: function (dashboardData) {
    const tiles = dashboardData.currentDashboard.tiles
    const rooms = [...new Set(tiles.map(t => t.content.roomName).filter(n => n))]
    return rooms.map(room => {
      const sensorValues = tiles
        .map(t => t.content)
        .filter(c => c.roomName === room)
        .flatMap(c => c.currentSensorValues)
        .filter(sv => sv !== undefined)
      return mapRoomValues(sensorValues, room)
    })
  }
}
