import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { login } from '../../lib/authStore';
import { useAuth } from '../../contexts/AuthContext';
import { signInWithGoogle } from '../../lib/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    const { error: oauthError } = await signInWithGoogle();
    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
    // On success, Supabase redirects the browser — no further action needed here.
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const { user, error: loginError } = await login(email, password);
    
    if (loginError) {
      setError(loginError);
    } else if (user) {
      setUser(user);
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <div className="pt-32 pb-24 bg-church-cream min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-church-earth/5"
        >
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-church-earth-dark mb-2">Welcome Back</h1>
            <p className="text-church-earth-light">Sign in to your account</p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-church-earth-dark mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-church-earth-dark mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-church-gold hover:bg-church-gold-dark text-white py-3 rounded-xl font-medium transition-colors btn-theme disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6 flex items-center">
            <div className="flex-1 border-t border-church-earth/15"></div>
            <span className="mx-4 text-xs text-church-earth-light uppercase tracking-wide">or</span>
            <div className="flex-1 border-t border-church-earth/15"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-church-earth/20 bg-white hover:bg-church-cream text-church-earth-dark py-3 rounded-xl font-medium transition-colors disabled:opacity-70"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>
          
          <div className="mt-8 text-center text-sm text-church-earth-light">
            Don't have an account?{' '}
            <Link to="/register" className="text-church-gold font-medium hover:underline">
              Create one
            </Link>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
