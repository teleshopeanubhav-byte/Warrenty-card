import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import WarrantyCard from './pages/WarrantyCard';
import { motion, AnimatePresence } from 'motion/react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLocalAuth, setIsLocalAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localAuth = localStorage.getItem('admin_auth') === 'true';
    setIsLocalAuth(localAuth);

    return onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-dark-bg text-gold">Loading...</div>;
  
  // Allow access if either Firebase user is logged in or local fallback is active
  if (!user && !isLocalAuth) return <Navigate to="/admin/login" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/warranty/:id" element={<WarrantyCard />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}
