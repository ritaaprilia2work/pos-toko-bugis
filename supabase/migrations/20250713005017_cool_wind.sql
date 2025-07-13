/*
  # Create Tobaku POS Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `username` (text, unique)
      - `password` (text, hashed)
      - `role` (enum: admin, staff)
      - `created_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text)
      - `sku` (text, unique)
      - `cost_price` (decimal)
      - `sell_price` (decimal)
      - `stock` (integer)
      - `min_stock` (integer)
      - `created_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `date` (timestamp)
      - `total` (decimal)
      - `payment_method` (enum: cash, non-cash)
      - `cashier_id` (uuid, foreign key)
      - `cashier_name` (text)
      - `note` (text, optional)
      - `created_at` (timestamp)
    
    - `transaction_items`
      - `id` (uuid, primary key)
      - `transaction_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `product_name` (text)
      - `quantity` (integer)
      - `unit_price` (decimal)
      - `total_price` (decimal)
      - `created_at` (timestamp)
    
    - `stock_logs`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `product_name` (text)
      - `type` (enum: IN, OUT)
      - `quantity` (integer)
      - `source` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for role-based access
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'staff');
CREATE TYPE payment_method AS ENUM ('cash', 'non-cash');
CREATE TYPE stock_type AS ENUM ('IN', 'OUT');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  sku text UNIQUE NOT NULL,
  cost_price decimal(10,2) NOT NULL DEFAULT 0,
  sell_price decimal(10,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  min_stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date timestamptz DEFAULT now(),
  total decimal(10,2) NOT NULL DEFAULT 0,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  cashier_id uuid REFERENCES users(id),
  cashier_name text,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Create transaction_items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  total_price decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create stock_logs table
CREATE TABLE IF NOT EXISTS stock_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  product_name text,
  type stock_type NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  source text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read all users" ON users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id::text);

-- Create policies for products table
CREATE POLICY "Anyone can read products" ON products
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert products" ON products
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update products" ON products
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete products" ON products
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Create policies for transactions table
CREATE POLICY "Users can read all transactions" ON transactions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert transactions" ON transactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = cashier_id::text);

-- Create policies for transaction_items table
CREATE POLICY "Users can read all transaction items" ON transaction_items
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert transaction items" ON transaction_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions 
      WHERE id = transaction_id 
      AND cashier_id::text = auth.uid()::text
    )
  );

-- Create policies for stock_logs table
CREATE POLICY "Users can read all stock logs" ON stock_logs
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert stock logs" ON stock_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Insert demo users (passwords should be hashed in production)
INSERT INTO users (name, username, password, role) VALUES
  ('Admin Tobaku', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
  ('Karyawan Toko', 'staff', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff')
ON CONFLICT (username) DO NOTHING;

-- Insert demo products
INSERT INTO products (name, category, sku, cost_price, sell_price, stock, min_stock) VALUES
  ('Marlboro Red', 'Rokok', 'MRL001', 20000, 25000, 50, 10),
  ('Beras Premium 5kg', 'Sembako', 'BRS001', 65000, 75000, 25, 5),
  ('Aqua 600ml', 'Minuman', 'AQU001', 2500, 3500, 100, 20),
  ('Minyak Goreng 1L', 'Sembako', 'MIG001', 14000, 18000, 15, 5),
  ('Indomie Goreng', 'Makanan', 'IDM001', 2500, 3000, 80, 15),
  ('Teh Botol Sosro', 'Minuman', 'TBS001', 3000, 4000, 60, 10)
ON CONFLICT (sku) DO NOTHING;