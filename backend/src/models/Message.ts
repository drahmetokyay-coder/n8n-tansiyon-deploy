import mongoose, { Document, Schema } from 'mongoose';

interface IMessage extends Document {
  matchId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  matchId: {
    type: Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ matchId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ isRead: 1 });

export default mongoose.model<IMessage>('Message', messageSchema);
