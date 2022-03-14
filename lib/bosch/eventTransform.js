/**
 *
 * @param {Device[]} devices
 * @param {Room[]} rooms
 * @return {{
 *   serviceToPoints: function(Service): InfluxPoint[]
 * }}
 */
module.exports = function (devices, rooms) {
  const roomToRoomName = {}
  for (const room of rooms) {
    roomToRoomName[room.id] = room.name
  }

  const deviceToDeviceName = {}
  const deviceToRoomName = {}
  for (const device of devices) {
    deviceToDeviceName[device.id] = device.name
    deviceToRoomName[device.id] = roomToRoomName[device.roomId]
  }

  /**
   *
   * @param {Service} e
   * @return {InfluxPoint[]}
   */
  function serviceToPoints (e) {
    const {
      path,
      deviceId,
      id
    } = e
    const roomName = deviceToRoomName[deviceId]
    let name = deviceToDeviceName[deviceId]
    if (path.match(/\/devices\/roomClimateControl.*/)) {
      name = deviceId
    }

    /**
     * @param {any} value
     * @return {InfluxPoint[]}
     */
    function createEvent (value) {
      return [{
        measurement: `bosch_${id}`,
        tags: { deviceId, name, roomName },
        fields: { value }
      }]
    }

    switch (id) {
      case 'TemperatureLevel':
        return createEvent(e.state.temperature)
      case 'ValveTappet':
        return createEvent(e.state.position)
      case 'RoomClimateControl':
        return createEvent(e.state.setpointTemperature)
      case 'ShutterContact':
        /**
         * ShutterContactState will always be collected
         * ShutterContact will only be used for events, because it is used for annotations
         */
        return [{
          measurement: `bosch_${id}`,
          tags: { deviceId, name, roomName },
          fields: {
            value: e.state.value,
            title: `Window in ${roomName} is ${e.state.value.toLowerCase()}`
          }
        }, {
          measurement: 'bosch_ShutterContactState',
          tags: { deviceId, name, roomName },
          fields: {
            value: e.state.value
          }
        }]
    }
    return []
  }

  return {
    serviceToPoints
  }
}
