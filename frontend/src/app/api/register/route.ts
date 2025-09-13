import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import mongoose from 'mongoose';


interface IUser extends mongoose.Document {
  email: string;
  password: string;
}

const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const existing = await User.findOne({ email });
  if (existing) {
  return NextResponse.json({ error: 'User already exists. Use another email.' }, { status: 409 });
  }
  const hashed = await hashPassword(password);
  const user = await User.create({ email, password: hashed });
  return NextResponse.json({ success: true });
}
