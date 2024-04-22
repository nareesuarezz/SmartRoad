const socketIo = require('socket.io');
let io;

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: {
        origin: "*", // Ajusta esto según tus necesidades
        methods: ["GET", "POST"]
      }
    });
    
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
};
