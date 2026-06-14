import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';

// Redirects to /login if no token, otherwise renders children
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

// Redirects logged-in users away from auth pages
function GuestRoute({ children }) {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <GuestRoute><Login /></GuestRoute>
          } />
          <Route path="/register" element={
            <GuestRoute><Register /></GuestRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/analytics/:id" element={
            <ProtectedRoute><Analytics /></ProtectedRoute>
          } />
          {/* Default → dashboard (protected, so redirects to login if needed) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
