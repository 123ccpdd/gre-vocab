import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyStats extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;           // YYYY-MM-DD
  newWords: number;
  reviewWords: number;
  correctRate: number;
  studyTime: number;
}

const dailyStatsSchema = new Schema<IDailyStats>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },       // YYYY-MM-DD
    newWords: { type: Number, default: 0 },
    reviewWords: { type: Number, default: 0 },
    correctRate: { type: Number, default: 0 },
    studyTime: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 复合唯一索引：每个用户每天只有一条记录（修复 streak bug 的关键）
dailyStatsSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyStats = mongoose.model<IDailyStats>('DailyStats', dailyStatsSchema);