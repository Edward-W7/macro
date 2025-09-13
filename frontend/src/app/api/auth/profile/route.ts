import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'No token' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = verifyToken(token);
    return NextResponse.json({ user: payload });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
