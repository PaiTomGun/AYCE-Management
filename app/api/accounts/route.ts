import { NextResponse } from 'next/server';
import { createAccount, getAllAccounts, updateAccountStatus, deleteAccount } from '@/lib/auth';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

// Get all accounts (admin only)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = getSession(sessionId);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const accounts = await getAllAccounts();
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create new account (admin only)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = getSession(sessionId);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { username, password, role } = await request.json();
    
    if (!username || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (role !== 'staff' && role !== 'admin') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    
    const result = await createAccount(username, password, role, user.id);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update account status (admin only)
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = getSession(sessionId);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { accountId, isActive } = await request.json();
    
    if (!accountId || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const result = await updateAccountStatus(accountId, isActive);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete account (admin only)
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = getSession(sessionId);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { accountId } = await request.json();
    
    if (!accountId) {
      return NextResponse.json({ error: 'Missing account ID' }, { status: 400 });
    }
    
    // Prevent deleting own account
    if (accountId === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }
    
    const result = await deleteAccount(accountId);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
