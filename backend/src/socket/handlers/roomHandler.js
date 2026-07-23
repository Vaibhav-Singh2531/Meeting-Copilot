import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default function roomHandler(io, socket) {
  socket.on('join-room', async ({ roomCode, userId, userName }) => {
    try {
      socket.join(roomCode);
      
      const meeting = await prisma.meeting.findUnique({
        where: { roomCode }
      });

      if (!meeting) {
        console.error(`Meeting not found for roomCode: ${roomCode}`);
        return;
      }

      // Upsert participant
      await prisma.participant.upsert({
        where: {
          meetingId_userId: {
            meetingId: meeting.id,
            userId
          }
        },
        update: {
          joinedAt: new Date(),
          leftAt: null
        },
        create: {
          meetingId: meeting.id,
          userId,
          role: 'PARTICIPANT'
        }
      });

      // Notify others in room
      socket.to(roomCode).emit('user-joined', { userId, userName });

      // Send back list of all current users with no leftAt
      const currentParticipants = await prisma.participant.findMany({
        where: {
          meetingId: meeting.id,
          leftAt: null
        },
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      });

      const formattedUsers = currentParticipants.map(p => ({
        userId: p.userId,
        userName: p.user.name
      }));

      socket.emit('room-users', formattedUsers);
    } catch (error) {
      console.error('Error in join-room handler:', error);
    }
  });

  socket.on('leave-room', async ({ roomCode, userId }) => {
    try {
      socket.leave(roomCode);

      const meeting = await prisma.meeting.findUnique({
        where: { roomCode }
      });

      if (!meeting) return;

      // Safely update without requiring exact unique index verification if it fails
      await prisma.participant.updateMany({
        where: {
          meetingId: meeting.id,
          userId
        },
        data: {
          leftAt: new Date()
        }
      });

      socket.to(roomCode).emit('user-left', { userId });
    } catch (error) {
      console.error('Error in leave-room handler:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected (from room handler): ${socket.id}`);
  });
}
