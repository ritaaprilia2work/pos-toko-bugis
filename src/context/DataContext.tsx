import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Product, Transaction, StockLog } from '../types';

interface DataContextType {
  products: Product[];
  transactions: Transaction[];
  stockLogs: StockLog[];
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  updateStock: (productId: string, quantity: number, type: 'IN' | 'OUT', source: string) => Promise<void>;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const refreshData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchTransactions(),
        fetchStockLogs(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedTransactions = data?.map(transaction => ({
        ...transaction,
        date: transaction.created_at,
        items: transaction.transaction_items || []
      })) || [];
      
      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchStockLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStockLogs(data || []);
    } catch (error) {
      console.error('Error fetching stock logs:', error);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      setProducts(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === id ? data : p));
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'date'>) => {
    try {
      // Start a transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          total: transactionData.total,
          payment_method: transactionData.payment_method,
          cashier_id: transactionData.cashier_id,
          cashier_name: transactionData.cashier_name,
          note: transactionData.note,
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Add transaction items
      const itemsWithTransactionId = transactionData.items.map(item => ({
        transaction_id: transaction.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(itemsWithTransactionId);

      if (itemsError) throw itemsError;

      // Update stock for each item
      for (const item of transactionData.items) {
        await updateStock(item.product_id, item.quantity, 'OUT', 'Penjualan');
      }

      await refreshData();
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const updateStock = async (productId: string, quantity: number, type: 'IN' | 'OUT', source: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error('Product not found');

      const newStock = type === 'IN' ? product.stock + quantity : product.stock - quantity;
      
      // Update product stock
      await updateProduct(productId, { stock: Math.max(0, newStock) });

      // Add stock log
      const { error } = await supabase
        .from('stock_logs')
        .insert([{
          product_id: productId,
          product_name: product.name,
          type,
          quantity,
          source,
        }]);

      if (error) throw error;
      
      await fetchStockLogs();
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
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
    refreshData,
    isLoading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};