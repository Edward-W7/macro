import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import mongoose from 'mongoose';


// HIGHLIGHT: Minimal User schema for demonstration
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
  // HIGHLIGHT: Check if user exists
  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }
  // HIGHLIGHT: Hash password and create user
  const hashed = await hashPassword(password);
  const user = await User.create({ email, password: hashed });
  // HIGHLIGHT: Optionally sign a JWT (not returned here)
  return NextResponse.json({ success: true });
}
