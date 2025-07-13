import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Package, ShoppingCart } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';

const Reports: React.FC = () => {
  const { transactions, products, isLoading } = useData();
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: startOfDay(now), end: endOfDay(now) };
    }
  };

  const { start, end } = getDateRange();
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= start && transactionDate <= end;
  });

  // Statistics
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = filteredTransactions.length;
  const totalProfit = filteredTransactions.reduce((sum, transaction) => {
    return sum + transaction.items.reduce((itemSum, item) => {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        return itemSum + ((item.unit_price - product.cost_price) * item.quantity);
      }
      return itemSum;
    }, 0);
  }, 0);

  // Best selling products
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  
  filteredTransactions.forEach(transaction => {
    transaction.items.forEach(item => {
      const existing = productSales.get(item.product_id);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.total_price;
      } else {
        productSales.set(item.product_id, {
          name: item.product_name,
          quantity: item.quantity,
          revenue: item.total_price
        });
      }
    });
  });

  const bestSellingProducts = Array.from(productSales.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Daily sales for chart
  const dailySales = new Map<string, number>();
  filteredTransactions.forEach(transaction => {
    const date = format(new Date(transaction.date), 'dd/MM');
    dailySales.set(date, (dailySales.get(date) || 0) + transaction.total);
  });

  const chartData = Array.from(dailySales.entries()).map(([date, total]) => ({
    date,
    total
  }));

  // Category sales for pie chart
  const categorySales = new Map<string, number>();
  filteredTransactions.forEach(transaction => {
    transaction.items.forEach(item => {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        const current = categorySales.get(product.category) || 0;
        categorySales.set(product.category, current + item.total_price);
      }
    });
  });

  const pieData = Array.from(categorySales.entries()).map(([category, total]) => ({
    name: category,
    value: total
  }));

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Laporan & Analisis</h1>
        <div className="flex space-x-2">
          {(['today', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateRange === range
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range === 'today' ? 'Hari Ini' : range === 'week' ? 'Minggu Ini' : 'Bulan Ini'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Penjualan</p>
              <p className="text-2xl font-bold text-gray-900">Rp {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Laba Kotor</p>
              <p className="text-2xl font-bold text-gray-900">Rp {totalProfit.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transaksi</p>
              <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rata-rata/Transaksi</p>
              <p className="text-2xl font-bold text-gray-900">
                Rp {totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions).toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Penjualan Harian</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Penjualan']}
              />
              <Bar dataKey="total" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Penjualan per Kategori</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Penjualan']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produk Terlaris</h3>
          <div className="space-y-4">
            {bestSellingProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.quantity} unit terjual</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">Rp {product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {bestSellingProducts.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada data penjualan</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaksi Terbaru</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {filteredTransactions.slice(0, 10).map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">#{transaction.id.slice(-6)}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(transaction.date), 'dd MMM yyyy HH:mm', { locale: id })}
                  </p>
                  <p className="text-xs text-gray-500">{transaction.cashier_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">Rp {transaction.total.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 capitalize">{transaction.payment_method}</p>
                </div>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada transaksi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;