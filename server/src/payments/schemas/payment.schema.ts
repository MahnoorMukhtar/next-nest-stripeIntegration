import { Schema, Document } from 'mongoose';

export interface Payment extends Document {
  courseId: string;
  userId: string;
  sessionId: string;
  paymentIntentId: string;
  amount: number;
  status: string;
  createdAt: Date;
}

export const PaymentSchema = new Schema({
  courseId: { type: String, required: true },
  userId: { type: String, required: true },
  sessionId: { type: String, required: true },
  paymentIntentId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now },
});