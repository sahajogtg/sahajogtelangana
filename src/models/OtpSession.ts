import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpSession extends Document {
  phone: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  createdAt: Date;
}

const OtpSessionSchema = new Schema<IOtpSession>({
  phone: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0, max: 3 },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

OtpSessionSchema.index({ phone: 1, createdAt: -1 });
OtpSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OtpSession || mongoose.model<IOtpSession>('OtpSession', OtpSessionSchema);
