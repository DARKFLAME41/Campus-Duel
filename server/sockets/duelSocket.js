module.exports = function registerDuelSocket(io, socket) {
  socket.on('duel:join', roomId => {
    socket.join(`duel:${roomId}`);
    socket.to(`duel:${roomId}`).emit('duel:opponent-status', { message: 'Opponent connected to room' });
  });
  socket.on('duel:code', ({ roomId, code }) => socket.to(`duel:${roomId}`).emit('duel:code', { code }));
  socket.on('duel:status', ({ roomId, status, testsPassed }) => {
    socket.to(`duel:${roomId}`).emit('duel:opponent-status', { message: status, testsPassed });
  });
  socket.on('duel:typing', ({ roomId }) => {
    socket.to(`duel:${roomId}`).emit('duel:opponent-status', { message: 'Opponent is typing...' });
  });
};

