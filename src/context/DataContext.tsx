import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Transaction, StockLog } from '../types';

interface DataContextType {
  products: Product[];
  transactions: Transaction[];
  stockLogs: StockLog[];
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  updateStock: (productId: string, quantity: number, type: 'IN' | 'OUT', source: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Mock data for demo
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Marlboro Red',
    category: 'Rokok',
    sku: 'MRL001',
    cost_price: 20000,
    sell_price: 25000,
    stock: 50,
    min_stock: 10,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Beras Premium 5kg',
    category: 'Sembako',
    sku: 'BRS001',
    cost_price: 65000,
    sell_price: 75000,
    stock: 25,
    min_stock: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Aqua 600ml',
    category: 'Minuman',
    sku: 'AQU001',
    cost_price: 2500,
    sell_price: 3500,
    stock: 100,
    min_stock: 20,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Minyak Goreng 1L',
    category: 'Sembako',
    sku: 'MIG001',
    cost_price: 14000,
    sell_price: 18000,
    stock: 15,
    min_stock: 5,
    created_at: new Date().toISOString(),
  },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);

  const addProduct = (productData: Omit<Product, 'id' | 'created_at'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Update stock for each item
    transactionData.items.forEach(item => {
      updateStock(item.product_id, item.quantity, 'OUT', 'Penjualan');
    });
  };

  const updateStock = (productId: string, quantity: number, type: 'IN' | 'OUT', source: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStock = type === 'IN' ? product.stock + quantity : product.stock - quantity;
    updateProduct(productId, { stock: Math.max(0, newStock) });

    const newStockLog: StockLog = {
      id: Date.now().toString(),
      product_id: productId,
      product_name: product.name,
      type,
      quantity,
      source,
      created_at: new Date().toISOString(),
    };
    setStockLogs(prev => [newStockLog, ...prev]);
  };

  const value = {
    products,
    transactions,
    stockLogs,
    addProduct,
    updateProduct,
    deleteProduct,
    addTransaction,
    updateStock,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};