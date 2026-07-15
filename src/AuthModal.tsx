import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Lock, Eye, EyeOff, User, Loader } from 'lucide-react';
import { signIn, signUp } from './api';

type Mode = 'signin' | 'signup';

export default function AuthModal({ onClose, onSignIn }: { onClose: () => void; onSignIn: (user: { id: number; name: string; email: string }) => void }) {
  const [mode, setMode] = useState<Mode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const email = emailRef.current?.value || '';
      const password = passwordRef.current?.value || '';
      let result;
      if (mode === 'signin') {
        result = await signIn(email, password);
      } else {
        const name = nameRef.current?.value || '';
        result = await signUp(name, email, password);
        result = { ...result, name };
      }
      onSignIn(result as { id: number; name: string; email: string });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-[#111] rounded-[40px] border border-white/10 shadow-2xl p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10"
        >
          <X size={20} />
        </button>

        <div className="mb-10">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-white/10 mb-6">
            <div className="w-8 h-8 bg-black rounded-lg" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-white/40 font-medium mt-2">
            {mode === 'signin' ? 'Sign in to continue watching' : 'Start your free trial today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                ref={nameRef}
                type="text"
                name="name"
                placeholder="Full name"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-all font-medium"
              />
            </div>
          )}
          <div className="relative">
            <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              ref={emailRef}
              type="email"
              name="email"
              placeholder="Email address"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-all font-medium"
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              ref={passwordRef}
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-sm font-medium text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg hover:bg-white/90 transition-all active:scale-[0.98] shadow-xl shadow-white/5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {submitting ? <Loader size={20} className="animate-spin" /> : null}
            {submitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/30 text-sm font-medium">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-white font-bold hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
