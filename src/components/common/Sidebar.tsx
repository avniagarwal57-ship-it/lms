import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  Route,
  Trophy,
  Users,
  Bot,
  PlusCircle,
  FileCheck2,
  ShieldAlert,
  Settings,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';
import { playClickSound } from '../../utils/sound';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { user, soundEnabled } = useAuth();

  const handleNav = (tab: string) => {
    playClickSound(soundEnabled);
    setActiveTab(tab);
    onClose();
  };

  const navItemClass = (tab: string) => `
    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
    ${activeTab === tab
      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
    }
  `;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fadeIn"
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40 h-screen w-64 p-4 flex flex-col justify-between
          glass border-r border-slate-200/80 dark:border-slate-800/80 transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col gap-6">
          {/* Top Brand Header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <button
              onClick={() => handleNav('landing')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                Quest<span className="text-indigo-600 dark:text-indigo-400">Learn</span>
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {/* Core Learning Experience */}
            <div>
              <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Learner Hub
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNav('dashboard')}
                  className={navItemClass('dashboard')}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => handleNav('explore')}
                  className={navItemClass('explore')}
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Courses</span>
                </button>
                <button
                  onClick={() => handleNav('my-learning')}
                  className={navItemClass('my-learning')}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>My Learning</span>
                </button>
                <button
                  onClick={() => handleNav('learning-paths')}
                  className={navItemClass('learning-paths')}
                >
                  <Route className="w-4 h-4" />
                  <span>Learning Paths</span>
                </button>
              </nav>
            </div>

            {/* Gamification Hub */}
            <div>
              <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Gamification
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNav('achievements')}
                  className={navItemClass('achievements')}
                >
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Trophy Case</span>
                </button>
                <button
                  onClick={() => handleNav('leaderboard')}
                  className={navItemClass('leaderboard')}
                >
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Leaderboards</span>
                </button>
                <button
                  onClick={() => handleNav('ai-tutor')}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${activeTab === 'ai-tutor'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Bot className="w-4 h-4 text-pink-500" />
                    <span>Lumina AI Tutor</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-500">
                    AI
                  </span>
                </button>
              </nav>
            </div>

            {/* Instructor / Admin Section */}
            {(user?.role === 'instructor' || user?.role === 'admin') && (
              <div>
                <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                  <span>Instructor Studio</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold uppercase">
                    Pro
                  </span>
                </div>
                <nav className="space-y-1">
                  <button
                    onClick={() => handleNav('instructor')}
                    className={navItemClass('instructor')}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Course & Reviews</span>
                  </button>
                  <button
                    onClick={() => handleNav('course-creator')}
                    className={navItemClass('course-creator')}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Course</span>
                  </button>
                </nav>
              </div>
            )}

            {/* Admin Center */}
            {user?.role === 'admin' && (
              <div>
                <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                  <span>Admin Center</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold uppercase">
                    Admin
                  </span>
                </div>
                <nav className="space-y-1">
                  <button
                    onClick={() => handleNav('admin')}
                    className={navItemClass('admin')}
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>Platform Admin</span>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Preferences & User Card */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <button
            onClick={() => handleNav('settings')}
            className={navItemClass('settings')}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          {user && (
            <div
              onClick={() => handleNav('profile')}
              className="flex items-center gap-3 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize truncate">
                  {user.role} • LVL {user.level}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
