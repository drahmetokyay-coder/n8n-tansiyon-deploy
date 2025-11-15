import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/notificationService';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { page = 1, limit = 20 } = req.query;

    const result = await getUserNotifications(userId, Number(page), Number(limit));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

router.put('/:notificationId/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { notificationId } = req.params;

    const success = await markNotificationAsRead(notificationId, userId);
    if (!success) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

router.put('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    await markAllNotificationsAsRead(userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

export default router;
