import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Flame,
  Zap,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Shield,
  GraduationCap,
  Sparkles,
  Menu,
  X,
  Award,
  BookOpen,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, activeTab, setActiveTab }) => {
  const { user, theme, toggleTheme, soundEnabled, toggleSound, switchRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white md:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  Quest<span className="text-indigo-600 dark:text-indigo-400">Learn</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  Gamified
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Center: Live Gamification Stats Bar */}
        {user && (
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Streak Counter */}
            <div 
              title="Current Daily Learning Streak! Complete 1 lesson today to keep your flame alive."
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold shadow-sm"
            >
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse-subtle" />
              <span>{user.streakDays} Day Streak</span>
            </div>

            {/* Total XP Counter */}
            <div 
              title="Total Experience Points earned through lessons, quizzes, and missions."
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-sm"
            >
              <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{user.xp} XP</span>
            </div>

            {/* Level Indicator */}
            <div 
              title={`Level ${user.level} Scholar. Earn ${user.level * 300 - user.xp > 0 ? user.level * 300 - user.xp : 60} XP to advance.`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-sm"
            >
              <Award className="w-4 h-4 text-indigo-500" />
              <span>LVL {user.level}</span>
            </div>
          </div>
        )}

        {/* Right Controls: Role Switcher, Sound, Theme, User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Persona Switcher for Quick Evaluator Role Toggle */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Switch demo persona (Learner, Instructor, Admin)"
            >
              {user?.role === 'admin' ? (
                <Shield className="w-3.5 h-3.5 text-rose-500" />
              ) : user?.role === 'instructor' ? (
                <BookOpen className="w-3.5 h-3.5 text-purple-500" />
              ) : (
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
              )}
              <span className="capitalize hidden md:inline">{user?.role || 'Role'}</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 py-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 text-xs animate-fadeIn">
                <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Switch Active Persona
                </div>
                <button
                  onClick={() => {
                    switchRole('learner');
                    setRoleMenuOpen(false);
                    setActiveTab('dashboard');
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 ${
                    user?.role === 'learner' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <div>
                    <div>Alex Rivers</div>
                    <div className="text-[10px] text-slate-400 font-normal">Learner Persona</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    switchRole('instructor');
                    setRoleMenuOpen(false);
                    setActiveTab('instructor');
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/40 ${
                    user?.role === 'instructor' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <div>
                    <div>Dr. Sarah Chen</div>
                    <div className="text-[10px] text-slate-400 font-normal">Instructor Persona</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    switchRole('admin');
                    setRoleMenuOpen(false);
                    setActiveTab('admin');
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 ${
                    user?.role === 'admin' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Shield className="w-4 h-4 text-rose-500" />
                  <div>
                    <div>Marcus Vance</div>
                    <div className="text-[10px] text-slate-400 font-normal">Admin Persona</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Audio Effect Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute game sound effects' : 'Enable game sound effects'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Profile Avatar */}
          {user ? (
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 pl-1 group"
              title="View Learner Profile"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40 group-hover:ring-indigo-500 transition-all"
              />
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('auth')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-sm shadow-indigo-500/20"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
