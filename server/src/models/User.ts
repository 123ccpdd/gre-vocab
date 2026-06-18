import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  nickname: string;
  subscription: {
    status: 'free' | 'active' | 'expired';
    expiresAt?: Date;
    stripeId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      default: '',
    },
    subscription: {
      status: {
        type: String,
        enum: ['free', 'active', 'expired'],
        default: 'free',
      },
      expiresAt: { type: Date },
      stripeId: { type: String },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);