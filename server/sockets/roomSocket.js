module.exports = function registerRoomSocket(io, socket) {
  socket.on('room:join', roomCode => socket.join(`room:${roomCode}`));
  socket.on('room:message', ({ roomCode, message }) => socket.to(`room:${roomCode}`).emit('room:message', message));
};
