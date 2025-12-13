import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ user: null });
    }
    
    const user = getSession(sessionId);
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
