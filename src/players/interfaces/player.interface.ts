import { Document } from 'mongoose';

export interface Player extends Document {
  readonly celphone: string;
  readonly email: string;
  name: string;
  ranking: string;
  rankingPosition: number;
  urlPlayerPhoto: string;
}
