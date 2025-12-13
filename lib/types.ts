// Database Types
export type SessionStatus = 'active' | 'completed' | 'cancelled';

export interface RestaurantTable {
  id: string;
  table_code: string;
  seats: number;
  qr_code_slug: string | null;
  layout: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Tier {
  id: string;
  code: string;
  display_name: string;
  price_per_person_baht: number;
  priority: number;
  metadata: string | null;
  is_active: boolean;
  created_at: Date;
  archived_at: Date | null;
}

export interface MenuCategory {
  id: string;
  name: string;
  position: number | null;
  created_at: Date;
}

export interface MenuItem {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  is_available: boolean;
  is_deleted: boolean;
  stock: number | null;
  options: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface Session {
  id: string;
  table_id: string;
  started_at: Date;
  ended_at: Date | null;
  status: SessionStatus;
  session_tier_id: string | null;
  note: string | null;
  metadata: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface SessionCustomer {
  id: string;
  session_id: string;
  type: string | null;
  created_at: Date;
}

export interface Order {
  id: string;
  session_id: string;
  created_at: Date;
  status: string | null;
  metadata: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string | null;
  item_name_snapshot: string | null;
  quantity: number;
  notes: string | null;
  created_at: Date;
}

export interface Payment {
  id: string;
  session_id: string;
  customer_count: number;
  price_per_person_baht: number;
  amount_baht: number;
  method: string;
  processed_at: Date;
}

export interface SessionLog {
  id: string;
  session_id: string;
  customer_count: number;
  session_tier_code: string | null;
  duration_minutes: number | null;
  buffet_price_per_person_baht: number;
  total_amount_baht: number;
  payment_method: string;
  table_code: string | null;
  started_at: Date;
  ended_at: Date;
  logged_at: Date;
}

// UI Types
export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  category?: string;
}

export interface DashboardStats {
  sales_today: number;
  customer_now: number;
  active_table: number;
  available_table: number;
}

export interface TableWithStatus extends RestaurantTable {
  status: 'free' | 'occupied' | 'reserved';
  session?: Session & {
    customer_count: number;
    tier?: Tier;
  };
}

export interface MenuItemWithCategory extends MenuItem {
  category_name?: string;
  available_for_tiers?: string[];
}

// Auth Types
export type UserRole = 'staff' | 'admin';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}
