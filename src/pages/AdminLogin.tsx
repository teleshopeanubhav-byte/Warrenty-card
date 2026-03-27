import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, User, Lock, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { cn } from '../lib/utils';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Google Login failed:', err);
      setError('Google Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (username === 'admin' && password === 'admin123') {
      try {
        await signInWithEmailAndPassword(auth, 'admin@buntyelectronics.com', 'admin123');
        navigate('/admin/dashboard');
      } catch (err: any) {
        console.error('Firebase Auth failed:', err);
        if (err.code === 'auth/operation-not-allowed') {
          setError('Email/Password login is not enabled in Firebase Console. Please enable it or use Google Login.');
        } else if (err.code === 'auth/user-not-found') {
          setError('Admin account not found. Please enable Email/Password auth and create the account.');
        } else {
          setError('Authentication failed. Falling back to local session...');
          // Fallback for preview
          localStorage.setItem('admin_auth', 'true');
          setTimeout(() => navigate('/admin/dashboard'), 1500);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Invalid username or password');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass p-8 rounded-2xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <LogIn className="text-dark-bg" size={32} />
          </div>
          <h1 className="text-3xl font-bold gold-text">Admin Portal</h1>
          <p className="text-muted mt-2">Bunty Electronics & Bhagwan Traders</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm text-muted">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-muted" size={18} />
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 focus:border-gold outline-none transition-all"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-muted" size={18} />
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-12 focus:border-gold outline-none transition-all"
                placeholder="Enter password"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted hover:text-gold transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full gold-gradient text-dark-bg font-bold py-3.5 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? 'AUTHENTICATING...' : 'LOGIN TO DASHBOARD'}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-dark-surface px-2 text-muted">Or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white text-black font-bold py-3.5 rounded-xl shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-muted">
          Access restricted to authorized personnel only.
        </p>
      </motion.div>
    </div>
  );
}
