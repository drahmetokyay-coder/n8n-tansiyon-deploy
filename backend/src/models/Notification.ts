import mongoose, { Document, Schema } from 'mongoose';

interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'match' | 'message' | 'profile_view' | 'system';
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['match', 'message', 'profile_view', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  body: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: Schema.Types.Mixed,
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>('Notification', notificationSchema);
