import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Zap,
  Award,
  Clock,
  Play,
  CheckCircle2,
  Gift,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Star,
  Compass,
} from 'lucide-react';
import { Course, Lesson, DailyChallenge, Achievement, SystemStats } from '../types';
import { playSuccessSound, playXpSound } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
  onSelectCourse: (courseId: string) => void;
  onStartLesson: (courseId: string, lessonId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  setActiveTab,
  onSelectCourse,
  onStartLesson,
}) => {
  const { user, soundEnabled, updateUserXpLocally } = useAuth();
  const [loading, setLoading] = useState(true);
  const [continueCourse, setContinueCourse] = useState<Course | null>(null);
  const [continueLesson, setContinueLesson] = useState<Lesson | null>(null);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [claimedId, setClaimedId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, coursesRes] = await Promise.all([
        fetch('/api/gamification/dashboard'),
        fetch('/api/courses'),
      ]);

      if (dashRes.ok) {
        const data = await dashRes.json();
        setContinueCourse(data.continueCourse);
        setContinueLesson(data.continueLesson);
        setDailyChallenges(data.challenges || []);
        setAchievements(data.achievements || []);
        setStats(data.stats);
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setRecommendedCourses(coursesData.courses || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimChallenge = async (challengeId: string) => {
    try {
      const res = await fetch(`/api/gamification/claim-challenge/${challengeId}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setClaimedId(challengeId);
        playSuccessSound(soundEnabled);
        triggerConfetti();

        // Update challenge state locally
        setDailyChallenges(prev =>
          prev.map(c => (c.id === challengeId ? { ...c, claimed: true } : c))
        );

        // Update XP locally
        if (data.user) {
          updateUserXpLocally(data.xpAdded, false, data.user.level);
        }
      }
    } catch (err) {
      console.error('Failed to claim challenge:', err);
    }
  };

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Next level XP calculations
  const currentLvl = user?.level || 1;
  const currentXp = user?.xp || 0;
  const nextLvlXp = currentLvl * 300;
  const prevLvlXp = (currentLvl - 1) * 300;
  const levelProgress = Math.min(
    100,
    Math.round(((currentXp - prevLvlXp) / (nextLvlXp - prevLvlXp)) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner: Greeting & Daily Motivational Hook */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/50 border border-indigo-500/20 backdrop-blur-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Learner HQ</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {getGreeting()}, {user?.name.split(' ')[0] || 'Explorer'}! 👋
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl">
            You're on a <strong className="text-orange-500">{user?.streakDays || 1}-day streak</strong>! 
            Complete today's daily missions to claim up to <span className="text-amber-400 font-bold">+120 bonus XP</span>.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => setActiveTab('explore')}
            className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>Discover Courses</span>
          </button>
        </div>
      </div>

      {/* Gamification Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Streak Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-orange-500 animate-pulse-subtle" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Streak</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {user?.streakDays || 1} Days
            </div>
            <div className="text-[11px] text-orange-600 dark:text-orange-400 font-medium">
              🛡️ {user?.streakFreezes || 1} Freezes Available
            </div>
          </div>
        </div>

        {/* Total XP & Level Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total XP</span>
            </div>
            <span className="text-xs font-extrabold text-indigo-500">LVL {currentLvl}</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            {currentXp} XP
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, levelProgress)}%` }}
            />
          </div>
          <div className="mt-1 text-[10px] text-slate-400 text-right">
            {nextLvlXp - currentXp > 0 ? `${nextLvlXp - currentXp} XP to Level ${currentLvl + 1}` : 'Max Tier'}
          </div>
        </div>

        {/* Daily Goal Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Daily Study Goal</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {user?.dailyGoalMinutesCompleted || 15} / {user?.dailyGoalMinutes || 20}m
            </div>
            <div className="text-[11px] text-emerald-500 font-semibold">
              75% of goal reached
            </div>
          </div>
        </div>

        {/* Global League Standing */}
        <div 
          onClick={() => setActiveTab('leaderboard')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between cursor-pointer group hover:border-indigo-500/50 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">League Tier</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Gold League
              </div>
              <div className="text-[11px] text-indigo-500 font-bold group-hover:underline">
                Rank #4 • Top 5%
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Prominent Continue Learning Hero Card */}
      {continueCourse && continueLesson && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                <Play className="w-3 h-3 fill-current" />
                <span>Resume Where You Stopped</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                {continueCourse.title}
              </h2>
              <p className="text-indigo-100 text-sm flex items-center gap-2">
                <span>Current Lesson:</span>
                <strong className="underline underline-offset-4 font-bold">{continueLesson.title}</strong>
                <span>• +{continueLesson.xpReward} XP</span>
              </p>
            </div>

            <button
              onClick={() => onStartLesson(continueCourse.id, continueLesson.id)}
              className="px-8 py-4 rounded-2xl font-extrabold text-indigo-950 bg-white hover:bg-indigo-50 shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 group-hover:scale-105"
            >
              <Play className="w-5 h-5 fill-indigo-950 text-indigo-950" />
              <span>Continue Lesson</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Daily Missions & Weekly Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Challenges Column (Duolingo Style Missions) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-500" />
              <span>Daily Challenges</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Resets in 8h</span>
          </div>

          <div className="space-y-3">
            {dailyChallenges.map(challenge => (
              <div
                key={challenge.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {challenge.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {challenge.description}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    +{challenge.xpReward} XP
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Progress</span>
                    <span>
                      {challenge.current} / {challenge.goal}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        challenge.completed ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((challenge.current / challenge.goal) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Action button */}
                {challenge.completed ? (
                  challenge.claimed ? (
                    <div className="w-full py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Reward Claimed</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaimChallenge(challenge.id)}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 animate-pulse-subtle"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Claim +{challenge.xpReward} XP Reward!</span>
                    </button>
                  )
                ) : (
                  <div className="text-[11px] text-slate-400 italic">In progress...</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity & Study Analytics (Coursera/Modern Productivity App) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <span>Weekly Learning Velocity</span>
            </h3>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              This Week: 14.8 Hours
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-6">
            {/* Visual Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-6">
              {stats?.weeklyActivity?.map((item, idx) => {
                const maxHours = 4;
                const heightPercent = Math.min(100, Math.round((item.hours / maxHours) * 100));
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.hours}h
                    </div>
                    <div className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-700/60 rounded-xl overflow-hidden h-32 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-xl transition-all duration-500 group-hover:from-indigo-500 group-hover:to-pink-500"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="w-3 h-3 rounded bg-indigo-600 inline-block" />
                <span>Active Study Time (hours)</span>
              </div>
              <div className="text-emerald-500 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+22% higher than last week</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Courses Shelf (Netflix Style Discovery) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Recommended Based on Your Goals
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Curated for your trajectory in Full-Stack & Artificial Intelligence
            </p>
          </div>
          <button
            onClick={() => setActiveTab('explore')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedCourses.slice(0, 3).map(course => (
            <div
              key={course.id}
              onClick={() => onSelectCourse(course.id)}
              className="p-4 rounded-3xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-36 rounded-2xl overflow-hidden mb-3">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-950/80 backdrop-blur-md text-white">
                    {course.level}
                  </span>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-950/80 text-amber-400 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {course.rating}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  {course.category}
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1 mb-1 group-hover:text-indigo-500 transition-colors">
                  {course.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                  {course.shortDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{course.durationMinutes} mins</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
