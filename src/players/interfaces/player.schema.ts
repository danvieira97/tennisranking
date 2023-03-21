import * as mongoose from 'mongoose';

export const PlayerSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    celphone: { type: String },
    name: String,
    ranking: String,
    rankingPosition: Number,
    urlPlayerPhoto: String,
  },
  { timestamps: true, collection: 'players' },
);
