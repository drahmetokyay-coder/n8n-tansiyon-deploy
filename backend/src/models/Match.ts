import mongoose, { Document, Schema } from 'mongoose';
import { MatchStatus } from '../../../shared/types';

interface IMatch extends Document {
  jobSeekerId: mongoose.Types.ObjectId;
  employerId: mongoose.Types.ObjectId;
  jobPostId: mongoose.Types.ObjectId;
  status: MatchStatus;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
}

const matchSchema = new Schema<IMatch>({
  jobSeekerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobPostId: {
    type: Schema.Types.ObjectId,
    ref: 'JobPost',
    required: true
  },
  status: {
    type: String,
    enum: Object.values(MatchStatus),
    default: MatchStatus.MATCHED
  },
  lastMessageAt: Date
}, {
  timestamps: true
});

// Compound index to prevent duplicate matches
matchSchema.index({ jobSeekerId: 1, employerId: 1, jobPostId: 1 }, { unique: true });
matchSchema.index({ jobSeekerId: 1, status: 1 });
matchSchema.index({ employerId: 1, status: 1 });
matchSchema.index({ lastMessageAt: -1 });

export default mongoose.model<IMatch>('Match', matchSchema);
