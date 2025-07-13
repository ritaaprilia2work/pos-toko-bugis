import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Transaction, StockLog } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface DataContextType {
  products: Product[];
  transactions: Transaction[];
  stockLogs: StockLog[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  updateStock: (productId: string, quantity: number, type: 'IN' | 'OUT', source: string) => Promise<void>;
  refreshData: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data
  const refreshData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch transactions with items
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (*)
        `)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Fetch stock logs
      const { data: stockLogsData, error: stockLogsError } = await supabase
        .from('stock_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (stockLogsError) throw stockLogsError;

      // Transform data to match our types
      setProducts(productsData || []);
      
      const transformedTransactions = (transactionsData || []).map(t => ({
        ...t,
        items: t.transaction_items || []
      }));
      setTransactions(transformedTransactions);
      
      setStockLogs(stockLogsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setProducts([]);
      setTransactions([]);
      setStockLogs([]);
      setIsLoading(false);
    }
  }, [user]);

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [data, ...prev]);
      toast.success('Produk berhasil ditambahkan');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Gagal menambahkan produk');
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
      toast.success('Produk berhasil diperbarui');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Gagal memperbarui produk');
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
      toast.success('Produk berhasil dihapus');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Gagal menghapus produk');
      throw error;
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'date'>) => {
    try {
      // Insert transaction
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

      // Insert transaction items
      const itemsToInsert = transactionData.items.map(item => ({
        transaction_id: transaction.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      const { data: items, error: itemsError } = await supabase
        .from('transaction_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) throw itemsError;

      // Update stock for each item and create stock logs
      for (const item of transactionData.items) {
        await updateStock(item.product_id, item.quantity, 'OUT', 'Penjualan');
      }

      // Add to local state
      const newTransaction = {
        ...transaction,
        items: items || []
      };
      setTransactions(prev => [newTransaction, ...prev]);

      toast.success('Transaksi berhasil disimpan');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Gagal menyimpan transaksi');
      throw error;
    }
  };

  const updateStock = async (productId: string, quantity: number, type: 'IN' | 'OUT', source: string) => {
    try {
      // Get current product
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      // Calculate new stock
      const newStock = type === 'IN' 
        ? product.stock + quantity 
        : Math.max(0, product.stock - quantity);

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (updateError) throw updateError;

      // Create stock log
      const { data: stockLog, error: logError } = await supabase
        .from('stock_logs')
        .insert([{
          product_id: productId,
          product_name: product.name,
          type,
          quantity,
          source,
        }])
        .select()
        .single();

      if (logError) throw logError;

      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, stock: newStock } : p
      ));
      setStockLogs(prev => [stockLog, ...prev]);

    } catch (error) {
      console.error('Error updating stock:', error);
      if (source !== 'Penjualan') {
        toast.error('Gagal memperbarui stok');
      }
      throw error;
    }
  };

  const value = {
    products,
    transactions,
    stockLogs,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    addTransaction,
    updateStock,
    refreshData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};