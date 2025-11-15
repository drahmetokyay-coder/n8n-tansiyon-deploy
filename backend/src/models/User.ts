import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserType } from '../../../shared/types';

interface IUser extends Document {
  email: string;
  password: string;
  userType: UserType;
  profile: any;
  location: {
    type: string;
    coordinates: [number, number];
    address?: string;
    city?: string;
    country?: string;
  };
  isActive: boolean;
  fcmToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const jobSeekerProfileSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  photo: String,
  bio: String,
  skills: [String],
  experience: String,
  availability: {
    days: [String],
    hours: String
  },
  hourlyRate: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'TRY' }
  },
  education: String,
  languages: [String],
  resume: String
}, { _id: false });

const employerProfileSchema = new Schema({
  companyName: { type: String, required: true },
  contactName: { type: String, required: true },
  phone: String,
  logo: String,
  description: String,
  industry: String,
  companySize: String,
  website: String,
  verified: { type: Boolean, default: false }
}, { _id: false });

const locationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v: number[]) {
        return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
      },
      message: 'Invalid coordinates'
    }
  },
  address: String,
  city: String,
  country: String
}, { _id: false });

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    enum: Object.values(UserType),
    required: true
  },
  profile: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function(this: IUser, v: any) {
        if (this.userType === UserType.JOB_SEEKER) {
          return v.firstName && v.lastName;
        } else if (this.userType === UserType.EMPLOYER) {
          return v.companyName && v.contactName;
        }
        return false;
      },
      message: 'Invalid profile data for user type'
    }
  },
  location: {
    type: locationSchema,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  fcmToken: String
}, {
  timestamps: true
});

// Index for geospatial queries
userSchema.index({ location: '2dsphere' });
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
