module.exports = {
  /**
   * @param dashboardData
   * @return {import("influx").IPoint[]}
   */
  toInfluxEvents: function (dashboardData) {
    const tiles = dashboardData.currentDashboard.tiles
    const sensorValues = tiles.flatMap(t => {
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
    })
    return sensorValues.map(s => {
      return {
        measurement: s.type,
        fields: {
          value: s.value
        },
        tags: {
          room: s.roomName
        }
      }
    })
  }
}
