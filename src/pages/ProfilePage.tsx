import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Zap,
  Award,
  Clock,
  Sparkles,
  Edit3,
  Check,
  TrendingUp,
  Brain,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { playSuccessSound } from '../utils/sound';

export const ProfilePage: React.FC = () => {
  const { user, soundEnabled, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(user?.dailyGoalMinutes || 20);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, dailyGoalMinutes: Number(dailyGoalMinutes) }),
      });
      if (res.ok) {
        await refreshUser();
        setIsEditing(false);
        playSuccessSound(soundEnabled);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const skills = [
    { name: 'AI & Machine Learning', level: 85, color: 'from-indigo-600 to-purple-600' },
    { name: 'Full-Stack Web Dev', level: 78, color: 'from-blue-600 to-cyan-500' },
    { name: 'UI/UX Design Systems', level: 65, color: 'from-pink-600 to-rose-500' },
    { name: 'Cloud & Distributed Systems', level: 60, color: 'from-emerald-600 to-teal-500' },
    { name: 'Cybersecurity & OWASP', level: 52, color: 'from-amber-600 to-orange-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Profile Header Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="relative">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-indigo-500/30 shadow-lg"
            />
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md">
              LVL {user?.level || 1}
            </span>
          </div>

          <div className="space-y-2 max-w-lg">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold w-full"
                  placeholder="Your Name"
                />
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={2}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs w-full"
                  placeholder="Brief Bio / Goal"
                />
                <div className="flex items-center gap-2 text-xs">
                  <span>Daily Goal:</span>
                  <input
                    type="number"
                    value={dailyGoalMinutes}
                    onChange={e => setDailyGoalMinutes(Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                  <span>minutes/day</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {user?.name}
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {user?.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {user?.bio || 'Passionate lifelong learner expanding mastery across modern computer science.'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Edit Button */}
        <div>
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Gamification Core Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-orange-500" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Streak Record</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {user?.streakDays || 1} Days
            </div>
            <div className="text-[10px] text-orange-500 font-bold">Top 10% Consistency</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Total XP Earned</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {user?.xp || 0} XP
            </div>
            <div className="text-[10px] text-amber-500 font-bold">Tier 3 Master</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Quiz Accuracy</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              94.2%
            </div>
            <div className="text-[10px] text-emerald-500 font-bold">Passed 4 of 4 Quizzes</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Study Velocity</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              18.4 hrs
            </div>
            <div className="text-[10px] text-purple-400 font-bold">Past 30 Days</div>
          </div>
        </div>
      </div>

      {/* Main Analytics Row: Skill Radar & Strengths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skill Mastery Distribution */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-500" />
              <span>Skill Mastery Spectrum</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Evaluated based on completed lessons, interactive code submissions, and quizzes.
            </p>
          </div>

          <div className="space-y-4">
            {skills.map(skill => (
              <div key={skill.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{skill.name}</span>
                  <span>{skill.level}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${skill.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Learning Diagnostics & Recommendations */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <span>Lumina Diagnostic Insights</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Personalized strengths and targeted revision suggestions.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Superpower: Vector Retrieval & Embeddings</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                100% quiz accuracy on Cosine Distance and Reciprocal Rank Fusion! You possess clear intuition for high-dimensional search.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-500/30 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>Recommended Revision: Design Tokens & WCAG</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Revisit Chapter 1 in Design Systems to reinforce 4.5:1 text contrast ratios before moving to advanced UI animation modules.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-500/30 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="w-4 h-4" />
                <span>Habit Insight: Evening Focus Peak</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                You complete 68% of lessons between 7:00 PM and 10:00 PM. Keep your daily streak timer set around 8:00 PM for maximum retention!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
