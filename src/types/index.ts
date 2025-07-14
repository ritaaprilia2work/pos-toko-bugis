export interface User {
  id: string;
  name: string;
  role: 'admin' | 'staff';
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  cost_price: number;
  sell_price: number;
  stock: number;
  min_stock: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  date: string;
  total: number;
  payment_method: 'cash' | 'non-cash';
  cashier_id: string;
  cashier_name?: string;
  note?: string;
  items: TransactionItem[];
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface StockLog {
  id: string;
  product_id: string;
  product_name?: string;
  type: 'IN' | 'OUT';
  quantity: number;
  source: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  total: number;
}