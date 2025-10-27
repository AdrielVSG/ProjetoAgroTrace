import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Importar páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ScanPage from './pages/ScanPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import AddProductPage from './pages/AddProductPage';
import StockPage from './pages/StockPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import CatalogPage from './pages/CatalogPage';

// Componente para proteger rotas que precisam de autenticação
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
}

// Componente principal do App
function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Rota pública */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <LoginPage />} 
        />
        
        {/* Rotas protegidas */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/scan" 
          element={
            <ProtectedRoute>
              <ScanPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/catalog" 
          element={
            <ProtectedRoute>
              <CatalogPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/product/:id" 
          element={
            <ProtectedRoute>
              <ProductDetailsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/add-product" 
          element={
            <ProtectedRoute>
              <AddProductPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/stock" 
          element={
            <ProtectedRoute>
              <StockPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Rota padrão */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </div>
  );
}

// App principal com providers
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
