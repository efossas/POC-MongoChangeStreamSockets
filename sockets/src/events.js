
/*
  eventName: Check
  data: any
*/
const Check = (socket) => {
  socket.on('Check', (data) => {
    socket.emit('Check', data);
  });
};

/*
  eventName: JoinRoom
  data: [ROOM_UUID, ...]
*/
const JoinRoom = (socket) => {
  socket.on('JoinRoom', (data) => {
    console.info('joining: ' + data);
    for (let uuid of data) {
      socket.join(uuid);
    }
  });
};

/*
  eventName: LeaveRoom
  data: [ROOM_UUID, ...]
*/
const LeaveRoom = (socket) => {
  socket.on('LeaveRoom', (data) => {
    console.info('leaving: ' + data);
    for (let uuid of data) {
      socket.leave(uuid);
    }
  });
};

module.exports = {
  Check: Check,
  JoinRoom: JoinRoom,
  LeaveRoom: LeaveRoom
}
