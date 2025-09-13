import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@lib/db';
import User from '@/models/user';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signToken({ userId: user._id, email: user.email });

  return NextResponse.json({ token });
}
