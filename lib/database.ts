import pool from './db';
import { v4 as uuidv4 } from 'uuid';

// Helper function to execute queries
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Helper function for single row queries
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

// Helper function to generate UUIDs
export function generateId(): string {
  return uuidv4();
}

// Get active session by table ID
export async function getActiveSessionByTableId(tableId: string) {
  const sql = `
    SELECT s.*, 
           (SELECT COUNT(*) FROM session_customers WHERE session_id = s.id) as customer_count,
           t.display_name as tier_name,
           t.price_per_person_baht as tier_price
    FROM sessions s
    LEFT JOIN tiers t ON s.session_tier_id = t.id
    WHERE s.table_id = $1 AND s.status = 'active'
    LIMIT 1
  `;
  return queryOne(sql, [tableId]);
}

// Get all tables with their current status
export async function getTablesWithStatus() {
  const sql = `
    SELECT 
      rt.*,
      CASE 
        WHEN s.id IS NOT NULL THEN 'occupied'
        ELSE 'free'
      END as status,
      s.id as session_id,
      s.started_at,
      s.session_duration_minutes,
      (SELECT COUNT(*) FROM session_customers WHERE session_id = s.id) as customer_count,
      t.display_name as tier_name,
      t.price_per_person_baht as tier_price
    FROM restaurant_tables rt
    LEFT JOIN sessions s ON rt.id = s.table_id AND s.status = 'active'
    LEFT JOIN tiers t ON s.session_tier_id = t.id
    ORDER BY rt.table_code
  `;
  return query(sql);
}

// Get all active tiers
export async function getActiveTiers() {
  const sql = `
    SELECT * FROM tiers 
    WHERE is_active = true AND archived_at IS NULL
    ORDER BY priority ASC
  `;
  return query(sql);
}

// Get menu items with categories
export async function getMenuItems(tierId?: string) {
  let sql = `
    SELECT 
      mi.*,
      mc.name as category_name,
      mc.position as category_position
    FROM menu_items mi
    LEFT JOIN menu_categories mc ON mi.category_id = mc.id
    WHERE mi.is_deleted = false AND mi.is_available = true
  `;
  
  const params: string[] = [];
  if (tierId) {
    sql += ` AND EXISTS (
      SELECT 1 FROM menu_item_tiers mit 
      WHERE mit.item_id = mi.id AND mit.tier_id = $1
    )`;
    params.push(tierId);
  }
  
  sql += ` ORDER BY mc.position, mi.name`;
  return query(sql, params.length > 0 ? params : undefined);
}

// Get dashboard statistics
export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get sales today from both payments (active) and session_logs (completed)
  const salesQuery = `
    SELECT COALESCE(SUM(total_amount_baht), 0) as sales_today
    FROM session_logs
    WHERE DATE(ended_at) = DATE($1)
    UNION ALL
    SELECT COALESCE(SUM(amount_baht), 0)
    FROM payments
    WHERE DATE(processed_at) = DATE($1)
  `;
  
  const customerQuery = `
    SELECT COALESCE(SUM((SELECT COUNT(*) FROM session_customers WHERE session_id = s.id)), 0) as customer_now
    FROM sessions s
    WHERE s.status = 'active'
  `;
  
  const activeTableQuery = `
    SELECT COUNT(*) as active_table
    FROM sessions
    WHERE status = 'active'
  `;
  
  const availableTableQuery = `
    SELECT COUNT(*) as available_table
    FROM restaurant_tables rt
    WHERE NOT EXISTS (
      SELECT 1 FROM sessions s 
      WHERE s.table_id = rt.id AND s.status = 'active'
    )
  `;
  
  const [salesResults, customers, active, available] = await Promise.all([
    query(salesQuery, [today]),
    queryOne(customerQuery),
    queryOne(activeTableQuery),
    queryOne(availableTableQuery),
  ]);
  
  // Sum up sales from both queries
  const totalSales = salesResults.reduce((sum, row: any) => sum + Number(row.sales_today || 0), 0);
  
  return {
    sales_today: totalSales,
    customer_now: Number(customers?.customer_now || 0),
    active_table: Number(active?.active_table || 0),
    available_table: Number(available?.available_table || 0),
  };
}

// Create a new session
export async function createSession(
  tableId: string,
  tierId: string,
  customerCount: number,
  sessionDuration?: number
) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const sessionId = generateId();
    const now = new Date();
    
    // Create session
    await client.query(`
      INSERT INTO sessions (id, table_id, started_at, status, session_tier_id, session_duration_minutes, created_at, updated_at)
      VALUES ($1, $2, $3, 'active', $4, $5, $6, $7)
    `, [sessionId, tableId, now, tierId, sessionDuration || 90, now, now]);
    
    // Create session customers
    for (let i = 0; i < customerCount; i++) {
      const customerId = generateId();
      await client.query(`
        INSERT INTO session_customers (id, session_id, created_at)
        VALUES ($1, $2, $3)
      `, [customerId, sessionId, now]);
    }
    
    await client.query('COMMIT');
    return sessionId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Get session logs for analytics
export async function getSessionLogs(startDate?: Date, endDate?: Date) {
  let sql = `
    SELECT * FROM session_logs
    WHERE 1=1
  `;
  const params: Date[] = [];
  
  if (startDate) {
    params.push(startDate);
    sql += ` AND started_at >= $${params.length}`;
  }
  
  if (endDate) {
    params.push(endDate);
    sql += ` AND ended_at <= $${params.length}`;
  }
  
  sql += ` ORDER BY started_at DESC`;
  
  return query(sql, params.length > 0 ? params : undefined);
}
