import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICustomWord extends Document {
  userId: mongoose.Types.ObjectId;
  words: Types.Array<any>;    // Word[] 嵌入数组
  updatedAt: Date;
}

const customWordSchema = new Schema<ICustomWord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    words: [{ type: Schema.Types.Mixed }],
  },
  { timestamps: true }
);

export const CustomWord = mongoose.model<ICustomWord>('CustomWord', customWordSchema);