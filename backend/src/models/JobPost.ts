import mongoose, { Document, Schema } from 'mongoose';
import { JobType } from '../../../shared/types';

interface IJobPost extends Document {
  employerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  jobType: JobType;
  location: {
    type: string;
    coordinates: [number, number];
    address?: string;
    city?: string;
    country?: string;
  };
  requirements: {
    skills: string[];
    experience?: string;
    education?: string;
  };
  schedule: {
    days: string[];
    hours: string;
    hoursPerWeek?: number;
  };
  compensation: {
    amount: number;
    currency: string;
    period: string;
  };
  benefits?: string[];
  startDate?: Date;
  duration?: string;
  isActive: boolean;
  viewCount: number;
  swipeCount: number;
  matchCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  },
  address: String,
  city: String,
  country: String
}, { _id: false });

const jobPostSchema = new Schema<IJobPost>({
  employerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  jobType: {
    type: String,
    enum: Object.values(JobType),
    required: true
  },
  location: {
    type: locationSchema,
    required: true
  },
  requirements: {
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: function(v: string[]) {
          return v.length > 0;
        },
        message: 'At least one skill is required'
      }
    },
    experience: String,
    education: String
  },
  schedule: {
    days: {
      type: [String],
      required: true
    },
    hours: {
      type: String,
      required: true
    },
    hoursPerWeek: Number
  },
  compensation: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'TRY'
    },
    period: {
      type: String,
      enum: ['hour', 'day', 'week', 'month', 'project'],
      required: true
    }
  },
  benefits: [String],
  startDate: Date,
  duration: String,
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  swipeCount: {
    type: Number,
    default: 0
  },
  matchCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
jobPostSchema.index({ location: '2dsphere' });
jobPostSchema.index({ employerId: 1 });
jobPostSchema.index({ isActive: 1 });
jobPostSchema.index({ 'requirements.skills': 1 });
jobPostSchema.index({ createdAt: -1 });

export default mongoose.model<IJobPost>('JobPost', jobPostSchema);
