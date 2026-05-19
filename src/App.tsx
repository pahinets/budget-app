import { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LanguageProvider } from './hooks/useLanguage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem', fontStyle: 'italic' }}>Завантаження...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"           element={<Login />} />
            <Route path="/register"        element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password"  element={<ResetPassword />} />
            
            <Route path="/" element={
              <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute><Layout><Transactions /></Layout></ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}