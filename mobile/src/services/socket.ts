import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = __DEV__ ? 'http://localhost:3000' : 'https://your-production-api.com';

class SocketService {
  private socket: Socket | null = null;

  async connect() {
    const token = await AsyncStorage.getItem('authToken');

    if (!token) {
      console.error('No auth token found');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinMatch(matchId: string) {
    if (this.socket) {
      this.socket.emit('join_match', matchId);
    }
  }

  sendMessage(matchId: string, content: string) {
    if (this.socket) {
      this.socket.emit('send_message', { matchId, content });
    }
  }

  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  onNewNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('new_notification', callback);
    }
  }

  sendTyping(matchId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing', { matchId, isTyping });
    }
  }

  onUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
