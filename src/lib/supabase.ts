import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          username: string;
          password: string;
          role: 'admin' | 'staff';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          username: string;
          password: string;
          role?: 'admin' | 'staff';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          username?: string;
          password?: string;
          role?: 'admin' | 'staff';
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          category: string;
          sku: string;
          cost_price: number;
          sell_price: number;
          stock: number;
          min_stock: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          sku: string;
          cost_price?: number;
          sell_price?: number;
          stock?: number;
          min_stock?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          sku?: string;
          cost_price?: number;
          sell_price?: number;
          stock?: number;
          min_stock?: number;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          date: string;
          total: number;
          payment_method: 'cash' | 'non-cash';
          cashier_id: string;
          cashier_name: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date?: string;
          total: number;
          payment_method?: 'cash' | 'non-cash';
          cashier_id: string;
          cashier_name?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          total?: number;
          payment_method?: 'cash' | 'non-cash';
          cashier_id?: string;
          cashier_name?: string | null;
          note?: string | null;
          created_at?: string;
        };
      };
      transaction_items: {
        Row: {
          id: string;
          transaction_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          product_id: string;
          product_name: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      stock_logs: {
        Row: {
          id: string;
          product_id: string;
          product_name: string | null;
          type: 'IN' | 'OUT';
          quantity: number;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          product_name?: string | null;
          type: 'IN' | 'OUT';
          quantity?: number;
          source: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          product_name?: string | null;
          type?: 'IN' | 'OUT';
          quantity?: number;
          source?: string;
          created_at?: string;
        };
      };
    };
  };
}