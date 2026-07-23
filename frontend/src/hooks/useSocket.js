import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function useSocket({ roomCode, user }) {
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomCode || !user) return;

    // Connect to Socket.io backend
    const newSocket = io('http://localhost:5000', {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Tell server we joined
    newSocket.emit('join-room', {
      roomCode,
      userId: user.id,
      userName: user.name,
    });

    // Handle incoming participant lists
    newSocket.on('room-users', (currentUsers) => {
      setUsers(currentUsers);
    });

    // Handle new participant joining
    newSocket.on('user-joined', (newUser) => {
      setUsers((prev) => {
        if (prev.find(u => u.userId === newUser.userId)) return prev;
        return [...prev, newUser];
      });
    });

    // Handle participant leaving
    newSocket.on('user-left', ({ userId }) => {
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    // Cleanup when component unmounts
    return () => {
      newSocket.emit('leave-room', { roomCode, userId: user.id });
      newSocket.disconnect();
    };
  }, [roomCode, user]);

  return { users, socket, isConnected };
}
