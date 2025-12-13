import { User } from './types';
import { query, queryOne } from './database';
import crypto from 'crypto';

// Simple in-memory session store (in production, use Redis or a database)
const sessions = new Map<string, User>();

// Hash password using SHA256 (in production, use bcrypt or argon2)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    const passwordHash = hashPassword(password);
    const account = await queryOne<any>(
      'SELECT id, username, role FROM accounts WHERE username = $1 AND password_hash = $2 AND is_active = true',
      [username, passwordHash]
    );
    
    if (account) {
      return {
        id: account.id,
        username: account.username,
        role: account.role
      };
    }
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function createAccount(
  username: string,
  password: string,
  role: 'staff' | 'admin',
  createdBy: string
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    // Check if username already exists
    const existing = await queryOne(
      'SELECT id FROM accounts WHERE username = $1',
      [username]
    );
    
    if (existing) {
      return { success: false, error: 'Username already exists' };
    }
    
    const id = crypto.randomUUID();
    const passwordHash = hashPassword(password);
    
    await query(
      `INSERT INTO accounts (id, username, password_hash, role, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [id, username, passwordHash, role, createdBy]
    );
    
    return { success: true, id };
  } catch (error) {
    console.error('Create account error:', error);
    return { success: false, error: 'Failed to create account' };
  }
}

export async function getAllAccounts() {
  try {
    return await query<any>(
      `SELECT id, username, role, is_active, created_at, 
              (SELECT username FROM accounts a2 WHERE a2.id = accounts.created_by) as created_by_username
       FROM accounts 
       ORDER BY created_at DESC`
    );
  } catch (error) {
    console.error('Get accounts error:', error);
    return [];
  }
}

export async function updateAccountStatus(accountId: string, isActive: boolean) {
  try {
    await query(
      'UPDATE accounts SET is_active = $1, updated_at = NOW() WHERE id = $2',
      [isActive, accountId]
    );
    return { success: true };
  } catch (error) {
    console.error('Update account error:', error);
    return { success: false, error: 'Failed to update account' };
  }
}

export async function deleteAccount(accountId: string) {
  try {
    await query('DELETE FROM accounts WHERE id = $1', [accountId]);
    return { success: true };
  } catch (error) {
    console.error('Delete account error:', error);
    return { success: false, error: 'Failed to delete account' };
  }
}

export function createSession(user: User): string {
  const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessions.set(sessionId, user);
  return sessionId;
}

export function getSession(sessionId: string): User | null {
  return sessions.get(sessionId) || null;
}

export function destroySession(sessionId: string): void {
  sessions.delete(sessionId);
}
