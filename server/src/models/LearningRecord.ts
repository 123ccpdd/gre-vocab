import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningRecord extends Document {
  userId: mongoose.Types.ObjectId;
  wordId: string;
  status: 'new' | 'learning' | 'reviewing' | 'mastered';
  correctCount: number;
  incorrectCount: number;
  lastReviewDate: Date;
  nextReviewDate: Date;
  easeFactor: number;
  interval: number;
  createdAt: Date;
}

const learningRecordSchema = new Schema<ILearningRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    wordId: { type: String, required: true },
    status: {
      type: String,
      enum: ['new', 'learning', 'reviewing', 'mastered'],
      default: 'new',
    },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    lastReviewDate: { type: Date, default: Date.now },
    nextReviewDate: { type: Date, default: Date.now },
    easeFactor: { type: Number, default: 2.5 },
    interval: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 复合唯一索引：每个用户每个单词只有一条记录
learningRecordSchema.index({ userId: 1, wordId: 1 }, { unique: true });
// 复习查询索引
learningRecordSchema.index({ userId: 1, nextReviewDate: 1, status: 1 });

export const LearningRecord = mongoose.model<ILearningRecord>('LearningRecord', learningRecordSchema);