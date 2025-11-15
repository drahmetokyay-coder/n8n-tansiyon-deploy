import mongoose, { Document, Schema } from 'mongoose';
import { SwipeDirection } from '../../../shared/types';

interface ISwipe extends Document {
  userId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  targetType: 'User' | 'JobPost';
  direction: SwipeDirection;
  createdAt: Date;
}

const swipeSchema = new Schema<ISwipe>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  targetType: {
    type: String,
    enum: ['User', 'JobPost'],
    required: true
  },
  direction: {
    type: String,
    enum: Object.values(SwipeDirection),
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate swipes
swipeSchema.index({ userId: 1, targetId: 1 }, { unique: true });
swipeSchema.index({ userId: 1, direction: 1 });
swipeSchema.index({ createdAt: -1 });

export default mongoose.model<ISwipe>('Swipe', swipeSchema);
