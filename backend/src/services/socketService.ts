import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../utils/jwt';
import Message from '../models/Message';
import Match from '../models/Match';
import { createNotification } from './notificationService';

export let io: Server;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      (socket as any).userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    console.log(`✅ User connected: ${userId}`);

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Join match rooms
    socket.on('join_match', async (matchId: string) => {
      try {
        const match = await Match.findOne({
          _id: matchId,
          $or: [{ jobSeekerId: userId }, { employerId: userId }]
        });

        if (match) {
          socket.join(`match:${matchId}`);
          console.log(`User ${userId} joined match ${matchId}`);
        }
      } catch (error) {
        console.error('Join match error:', error);
      }
    });

    // Handle sending message
    socket.on('send_message', async (data: { matchId: string; content: string }) => {
      try {
        const { matchId, content } = data;

        // Verify user is part of match
        const match = await Match.findOne({
          _id: matchId,
          $or: [{ jobSeekerId: userId }, { employerId: userId }]
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        // Create message
        const message = new Message({
          matchId,
          senderId: userId,
          content
        });

        await message.save();

        // Update match
        match.lastMessageAt = new Date();
        await match.save();

        // Get populated message
        const populatedMessage = await Message.findById(message._id)
          .populate('senderId', 'profile.firstName profile.lastName profile.companyName');

        // Emit to match room
        io.to(`match:${matchId}`).emit('new_message', populatedMessage);

        // Send notification to recipient
        const recipientId = match.jobSeekerId.toString() === userId
          ? match.employerId.toString()
          : match.jobSeekerId.toString();

        await createNotification(
          recipientId,
          'message',
          'Yeni Mesaj',
          content.substring(0, 100),
          { matchId, messageId: message._id }
        );

        io.to(`user:${recipientId}`).emit('new_notification', {
          type: 'message',
          matchId
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data: { matchId: string; isTyping: boolean }) => {
      socket.to(`match:${data.matchId}`).emit('user_typing', {
        userId,
        isTyping: data.isTyping
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${userId}`);
    });
  });

  return io;
};

export const sendNotificationToUser = (userId: string, data: any): void => {
  if (io) {
    io.to(`user:${userId}`).emit('new_notification', data);
  }
};
