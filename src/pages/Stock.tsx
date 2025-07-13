import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { TrendingUp, TrendingDown, Package, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Stock: React.FC = () => {
  const { products, stockLogs, updateStock } = useData();
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [stockType, setStockType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState(0);
  const [source, setSource] = useState('');

  const handleStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || quantity <= 0 || !source) {
      toast.error('Harap isi semua field');
      return;
    }

    updateStock(selectedProduct, quantity, stockType, source);
    
    const action = stockType === 'IN' ? 'ditambah' : 'dikurangi';
    toast.success(`Stok berhasil ${action}`);
    
    setShowModal(false);
    setSelectedProduct('');
    setQuantity(0);
    setSource('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Stok</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Update Stok</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Stock */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Stok Saat Ini</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {products.map(product => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      product.stock <= product.min_stock
                        ? 'bg-red-100 text-red-800'
                        : product.stock <= product.min_stock * 2
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stock} unit
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Min: {product.min_stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stock History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Riwayat Mutasi Stok</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {stockLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {log.type === 'IN' ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">{log.product_name}</h4>
                      <p className="text-sm text-gray-600">{log.source}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${
                      log.type === 'IN' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {log.type === 'IN' ? '+' : '-'}{log.quantity}
                    </span>
                  </div>
                </div>
              ))}
              {stockLogs.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada riwayat mutasi stok</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Stok</h3>
            
            <form onSubmit={handleStockUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produk</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih Produk</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stok: {product.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStockType('IN')}
                    className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border ${
                      stockType === 'IN'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Masuk</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockType('OUT')}
                    className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border ${
                      stockType === 'OUT'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <TrendingDown className="h-4 w-4" />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g., Pembelian, Koreksi, Rusak"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Update Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;