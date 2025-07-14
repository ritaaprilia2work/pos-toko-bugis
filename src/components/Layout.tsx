import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  LogOut, 
  Store,
  Warehouse,
  Users
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { userProfile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navigation = [
    { name: 'Kasir', href: '/', icon: ShoppingCart, roles: ['admin', 'staff'] },
    { name: 'Produk', href: '/products', icon: Package, roles: ['admin'] },
    { name: 'Stok', href: '/stock', icon: Warehouse, roles: ['admin'] },
    { name: 'Laporan', href: '/reports', icon: BarChart3, roles: ['admin'] },
    { name: 'User', href: '/users', icon: Users, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userProfile?.role || '')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 shadow-lg fixed h-full">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <Store className="h-8 w-8 text-green-400" />
              <h1 className="text-xl font-bold text-white">Tobaku POS</h1>
            </div>
          </div>
          
          <nav className="mt-6 px-4">
            <div className="space-y-2">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-500 text-white'
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{userProfile?.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{userProfile?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 ml-64">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;