import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { comparePassword } from '@/lib/auth';
import mongoose from 'mongoose';

// HIGHLIGHT: Minimal User schema for demonstration
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  // HIGHLIGHT: Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  // HIGHLIGHT: Compare password
  const valid = await comparePassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  // HIGHLIGHT: Login success (add JWT/cookie logic as needed)
  return NextResponse.json({ success: true });
}
