/**
 * @param {Device[]} devices
 * @param {Room[]} rooms
 * @return {{deviceServicesToInfluxEvents: (function(string, Service[]): import("influx").IPoint[]), pollEventToInfluxEvent: ((function(*): ([{fields: {value: *}, measurement: *, tags: {name: *, deviceId: *, roomName: *}}]|[]))|*)}}
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

  function pollEventToInfluxEvent (e) {
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

    function createEvent (value) {
      return [{
        measurement: id,
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
        return [{
          measurement: id,
          tags: { deviceId, name, roomName },
          fields: {
            value: e.state.value,
            title: `Window in ${roomName} is ${e.state.value.toLowerCase()}`
          }
        }]
    }
    return []
  }

  /**
   * @param {string} deviceId
   * @param {Service[]}  services
   */
  function deviceServicesToInfluxEvents (deviceId, services) {
    const roomName = deviceToRoomName[deviceId]
    let name = deviceToDeviceName[deviceId]
    if (deviceId.match(/roomClimateControl.*/)) {
      name = deviceId
    }

    function createEvent (id, value) {
      return [{
        measurement: id,
        tags: { deviceId, name, roomName },
        fields: { value }
      }]
    }

    return services.flatMap(function (service) {
      switch (service.id) {
        case 'TemperatureLevel':
          return createEvent(service.id, service.state.temperature)
        case 'ValveTappet':
          return createEvent(service.id, service.state.position)
      }
      return []
    })
  }

  return {
    pollEventToInfluxEvent,
    deviceServicesToInfluxEvents
  }
}
