import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSettings extends Document {
  userId: mongoose.Types.ObjectId;
  dailyNewWords: number;
  dailyReviewLimit: number;
  enableSound: boolean;
  enableDarkMode: boolean;
  autoPlayPronunciation: boolean;
}

const userSettingsSchema = new Schema<IUserSettings>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dailyNewWords: { type: Number, default: 20 },
    dailyReviewLimit: { type: Number, default: 100 },
    enableSound: { type: Boolean, default: true },
    enableDarkMode: { type: Boolean, default: false },
    autoPlayPronunciation: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserSettings = mongoose.model<IUserSettings>('UserSettings', userSettingsSchema);