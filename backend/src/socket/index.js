import { Server } from 'socket.io';
import roomHandler from './handlers/roomHandler.js';
import audioHandler from './handlers/audioHandler.js';

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    roomHandler(io, socket);
    audioHandler(io, socket);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};
