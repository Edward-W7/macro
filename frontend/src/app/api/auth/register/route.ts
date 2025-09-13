import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/user';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, password } = await req.json();

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const hashed = await hashPassword(password);
  const user = new User({ email, password: hashed });
  await user.save();

  return NextResponse.json({ message: 'User registered' });
}
