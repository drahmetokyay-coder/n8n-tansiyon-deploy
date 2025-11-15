import Notification from '../models/Notification';
import User from '../models/User';

export const createNotification = async (
  userId: string,
  type: 'match' | 'message' | 'profile_view' | 'system',
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      body,
      data
    });

    await notification.save();

    // TODO: Send push notification using Firebase
    const user = await User.findById(userId).select('fcmToken');
    if (user?.fcmToken) {
      // Implementation with Firebase Admin SDK
      // await sendPushNotification(user.fcmToken, title, body, data);
      console.log(`📲 Push notification would be sent to user ${userId}`);
    }
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

export const getUserNotifications = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<any> => {
  const notifications = await Notification.find({ userId })
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Notification.countDocuments({ userId });
  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
): Promise<boolean> => {
  const notification = await Notification.findOne({ _id: notificationId, userId });

  if (!notification) {
    return false;
  }

  notification.isRead = true;
  await notification.save();
  return true;
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
};
