import React, { useState, useEffect } from 'react';
import { Achievement, LeaderboardEntry } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Flame,
  Zap,
  Award,
  Sparkles,
  ShieldCheck,
  Moon,
  Layers,
  Compass,
  Star,
  Lock,
  Crown,
} from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'trophies' | 'leaderboard'>('trophies');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [dashRes, leadRes] = await Promise.all([
        fetch('/api/gamification/dashboard'),
        fetch('/api/leaderboard'),
      ]);

      if (dashRes.ok) {
        const data = await dashRes.json();
        setAchievements(data.achievements || []);
      }
      if (leadRes.ok) {
        const data = await leadRes.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error('Failed to load achievements & leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-indigo-400" />;
      case 'Flame':
        return <Flame className="w-6 h-6 text-orange-400 fill-orange-400" />;
      case 'Award':
        return <Award className="w-6 h-6 text-amber-400" />;
      case 'Moon':
        return <Moon className="w-6 h-6 text-purple-400" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-pink-400" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
      case 'Compass':
        return <Compass className="w-6 h-6 text-cyan-400" />;
      default:
        return <Trophy className="w-6 h-6 text-amber-400" />;
    }
  };

  const filteredAchievements = achievements.filter(a => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-900/30 via-indigo-900/30 to-purple-900/40 border border-amber-500/20 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>Hall of Mastery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Trophies & Leaderboards
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-xl">
            You've unlocked <strong>{unlockedCount} of {achievements.length} badges</strong>! 
            Compete in weekly leagues and climb from Bronze to Diamond.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('trophies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'trophies'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            Trophy Case
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            Weekly League
          </button>
        </div>
      </div>

      {activeTab === 'trophies' ? (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {['all', 'streak', 'xp', 'quizzes', 'courses', 'special'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'All Trophies' : `${cat} Badges`}
              </button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAchievements.map(ach => {
              const isUnlocked = Boolean(ach.unlockedAt);
              const progressVal = ach.progress || 0;
              const maxVal = ach.maxProgress || 1;
              const progressPct = Math.min(100, Math.round((progressVal / maxVal) * 100));

              return (
                <div
                  key={ach.id}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between group ${
                    isUnlocked
                      ? 'bg-white dark:bg-slate-900 border-indigo-500/30 shadow-md hover:shadow-xl hover:-translate-y-1'
                      : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-70'
                  }`}
                >
                  <div>
                    {/* Badge Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
                        isUnlocked
                          ? 'bg-gradient-to-tr from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {isUnlocked ? getBadgeIcon(ach.icon) : <Lock className="w-6 h-6 text-slate-400" />}
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        +{ach.xpReward} XP
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                      {ach.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {ach.description}
                    </p>
                  </div>

                  <div>
                    {isUnlocked ? (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold text-emerald-500 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Unlocked {new Date(ach.unlockedAt!).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                          <span>Progress</span>
                          <span>{progressVal} / {maxVal}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Weekly League Leaderboard */
        <div className="space-y-8">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Rank 2 (Silver) */}
            {leaderboard[1] && (
              <div className="p-6 rounded-3xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-center flex flex-col items-center justify-between order-2 md:order-1">
                <div className="w-10 h-10 rounded-full bg-slate-300 text-slate-800 font-extrabold flex items-center justify-center text-sm mb-3">
                  2
                </div>
                <img
                  src={leaderboard[1].avatar}
                  alt={leaderboard[1].name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-300 mb-3"
                />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {leaderboard[1].name}
                </h3>
                <div className="text-xs text-slate-500 mt-1">Silver Tier</div>
                <div className="mt-4 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-extrabold">
                  {leaderboard[1].xp} XP
                </div>
              </div>
            )}

            {/* Rank 1 (Gold) */}
            {leaderboard[0] && (
              <div className="p-8 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-yellow-500/10 to-indigo-500/20 border-2 border-amber-400 text-center flex flex-col items-center justify-between shadow-xl order-1 md:order-2 md:-translate-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-base mb-3 shadow-lg">
                  <Crown className="w-6 h-6 fill-slate-950" />
                </div>
                <img
                  src={leaderboard[0].avatar}
                  alt={leaderboard[0].name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400 mb-3 shadow-lg"
                />
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {leaderboard[0].name}
                </h3>
                <div className="text-xs text-amber-500 font-bold mt-1">🏆 1st Place • Diamond League</div>
                <div className="mt-4 px-6 py-2 rounded-full bg-amber-400 text-slate-950 text-sm font-black shadow-md">
                  {leaderboard[0].xp} XP
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {leaderboard[2] && (
              <div className="p-6 rounded-3xl bg-amber-900/10 dark:bg-amber-950/20 border border-amber-700/40 text-center flex flex-col items-center justify-between order-3">
                <div className="w-10 h-10 rounded-full bg-amber-700 text-white font-extrabold flex items-center justify-center text-sm mb-3">
                  3
                </div>
                <img
                  src={leaderboard[2].avatar}
                  alt={leaderboard[2].name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-700 mb-3"
                />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {leaderboard[2].name}
                </h3>
                <div className="text-xs text-slate-500 mt-1">Bronze Tier</div>
                <div className="mt-4 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-extrabold">
                  {leaderboard[2].xp} XP
                </div>
              </div>
            )}
          </div>

          {/* Full Leaderboard Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-400 tracking-wider">
              Gold League Rankings
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaderboard.map(entry => (
                <div
                  key={entry.userId}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    entry.isCurrentUser
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-center font-extrabold text-sm text-slate-400">
                      #{entry.rank}
                    </span>
                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{entry.name}</span>
                        {entry.isCurrentUser && (
                          <span className="px-2 py-0.2 text-[10px] rounded-full bg-indigo-600 text-white font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-orange-500 flex items-center gap-1 font-semibold">
                        <Flame className="w-3.5 h-3.5 fill-orange-500" />
                        <span>{entry.streakDays} day streak</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {entry.tier}
                    </span>
                    <span className="text-sm font-extrabold text-amber-500">
                      {entry.xp} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
