import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;
    
    if (sessionId) {
      destroySession(sessionId);
    }
    
    cookieStore.delete('session');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
