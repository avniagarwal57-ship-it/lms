import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, GraduationCap, BookOpen, Shield, ArrowRight, UserPlus, LogIn, Check } from 'lucide-react';
import { playSuccessSound } from '../utils/sound';

interface AuthPageProps {
  setActiveTab: (tab: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ setActiveTab }) => {
  const { login, signup, soundEnabled } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'learner' | 'instructor' | 'admin'>('learner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        if (!name.trim() || !email.trim()) {
          setError('Please provide your name and email');
          setLoading(false);
          return;
        }
        const success = await signup(name, email, role);
        if (success) {
          playSuccessSound(soundEnabled);
          setActiveTab('dashboard');
        } else {
          setError('Failed to create account. Please try again.');
        }
      } else {
        if (!email.trim()) {
          setError('Please enter your email');
          setLoading(false);
          return;
        }
        const success = await login(email);
        if (success) {
          playSuccessSound(soundEnabled);
          setActiveTab('dashboard');
        } else {
          setError('User not found. Try one of the demo quick-logins below!');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (targetRole: 'learner' | 'instructor' | 'admin') => {
    setLoading(true);
    await login(undefined, targetRole);
    playSuccessSound(soundEnabled);
    if (targetRole === 'instructor') {
      setActiveTab('instructor');
    } else if (targetRole === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/30 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {isSignup ? 'Create your QuestLearn account' : 'Welcome back to QuestLearn'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {isSignup
              ? 'Join our gamified learning community today'
              : 'Pick up right where you left off on your streak'}
          </p>
        </div>

        {/* Demo Fast-Login Cards for Quick Evaluation */}
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-3 text-center">
            ⚡ Quick Demo Logins (Instant Access)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('learner')}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:border-indigo-500 border border-slate-200 dark:border-slate-700 text-center transition-all group flex flex-col items-center shadow-sm"
            >
              <GraduationCap className="w-5 h-5 text-indigo-500 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Alex</span>
              <span className="text-[10px] text-slate-400">Learner</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('instructor')}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:border-purple-500 border border-slate-200 dark:border-slate-700 text-center transition-all group flex flex-col items-center shadow-sm"
            >
              <BookOpen className="w-5 h-5 text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Dr. Sarah</span>
              <span className="text-[10px] text-slate-400">Instructor</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:border-rose-500 border border-slate-200 dark:border-slate-700 text-center transition-all group flex flex-col items-center shadow-sm"
            >
              <Shield className="w-5 h-5 text-rose-500 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Marcus</span>
              <span className="text-[10px] text-slate-400">Admin</span>
            </button>
          </div>
        </div>

        {/* Custom Auth Form */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {isSignup && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  I want to join as
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="learner">Student / Learner</option>
                  <option value="instructor">Course Instructor</option>
                  <option value="admin">Platform Administrator</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <span>Processing...</span>
              ) : isSignup ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              {isSignup
                ? 'Already have an account? Sign in here'
                : "Don't have an account? Sign up free"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
