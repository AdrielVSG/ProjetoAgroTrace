import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  QrCode, 
  Package, 
  Plus, 
  History, 
  User, 
  Menu, 
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isProducer = user?.type === 'producer';
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Escanear QR', href: '/scan', icon: QrCode },
    { name: 'Catálogo', href: '/catalog', icon: Package },
    { name: 'Histórico', href: '/history', icon: History },
    ...(isProducer ? [
      { name: 'Adicionar Produto', href: '/add-product', icon: Plus },
      { name: 'Estoque', href: '/stock', icon: Package },
    ] : []),
    { name: 'Perfil', href: '/profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-sidebar-foreground">AgroTrace</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-sidebar-foreground hover:text-sidebar-accent-foreground"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center">
                  <User className="h-5 w-5 text-sidebar-primary-foreground" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-sidebar-foreground">
                  {user?.displayName || user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-sidebar-accent-foreground">
                  {user?.type === 'producer' ? 'Produtor' : 'Consumidor'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-3 w-full flex items-center px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-sidebar border-r border-sidebar-border">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-sidebar-foreground">AgroTrace</h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center">
                  <User className="h-5 w-5 text-sidebar-primary-foreground" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-sidebar-foreground">
                  {user?.displayName || user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-sidebar-accent-foreground">
                  {user?.type === 'producer' ? 'Produtor' : 'Consumidor'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-3 w-full flex items-center px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="lg:pl-64">
        {/* Header Mobile */}
        <div className="lg:hidden flex h-16 items-center justify-between px-4 bg-card border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-foreground hover:text-accent-foreground"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">AgroTrace</h1>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Conteúdo */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
