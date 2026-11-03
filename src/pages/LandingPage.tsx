import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Flame,
  Zap,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Bot,
  Layers,
  BarChart3,
  Star,
  Shield,
  Play,
} from 'lucide-react';
import { playSuccessSound } from '../utils/sound';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
  onExploreCourse: (courseId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab, onExploreCourse }) => {
  const { user, soundEnabled } = useAuth();

  const handleStart = () => {
    playSuccessSound(soundEnabled);
    if (user) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('auth');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Ambient Gradient Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
            <span>The Next Generation of Learning</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1] mb-6">
            Where Curiosity Meets <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Unstoppable Habit.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Gamified like <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">Duolingo</strong>. 
            Organized like <strong className="text-purple-600 dark:text-purple-400 font-semibold">Notion</strong>. 
            Structured like <strong className="text-pink-600 dark:text-pink-400 font-semibold">Coursera</strong>. 
            Powered by modern AI tutoring.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 shadow-xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 group text-base"
            >
              <span>{user ? 'Go to Learner Dashboard' : 'Start Learning Free'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 shadow-sm transition-all text-base"
            >
              Browse 50+ Courses
            </button>
          </div>

          {/* Live Micro-Pill Social Proof */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>14,000+ Active Streaks Kept</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>1.2M+ XP Points Earned</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>4.9 / 5 Average Course Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid: The 4 Pillars */}
      <section className="py-16 bg-slate-100/50 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Designed for Deep Focus & Joy
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              We eliminated the boring corporate LMS clutter and engineered an experience that makes you say: <em>"Just one more lesson!"</em>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6 fill-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Addictive Gamification
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                XP multipliers, daily streak freezes, achievement trophies, and league leaderboards that celebrate your consistency.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Notion-Clean Blocks
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Modular markdown lessons, interactive code sandboxes, personal sticky notes, and toggleable syllabus trees.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Lumina AI Personal Tutor
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Ask for intuitive analogies, incremental hints, real-world industry examples, or generate custom 4-week study paths.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Coursera-Grade Rigor
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Practical code assignments with rubric grading, video playback speed controls, interactive quizzes, and certificates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Spotlight */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
            <div>
              <div className="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
                Master Top In-Demand Skills
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Featured Masterclasses
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('explore')}
              className="mt-4 md:mt-0 font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 text-sm"
            >
              <span>Explore All Courses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div
              onClick={() => onExploreCourse('course-ai-agentic')}
              className="group cursor-pointer rounded-3xl overflow-hidden bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 shadow-sm hover:shadow-xl transition-all flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80"
                  alt="Full-Stack AI Engineering"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-3 py-1 text-xs font-extrabold rounded-full bg-indigo-600 text-white shadow-md">
                  Intermediate
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  4.9
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    AI & Machine Learning
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-500 transition-colors">
                    Full-Stack AI Engineering: From RAG to Autonomous Agents
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
                    Master modern AI architectures: vector search, hybrid retrieval, agent tool-calling, and production deployment.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Dr. Sarah Chen</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    Start Learning <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => onExploreCourse('course-design-systems')}
              className="group cursor-pointer rounded-3xl overflow-hidden bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 shadow-sm hover:shadow-xl transition-all flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80"
                  alt="Modern UI/UX Design Systems"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-3 py-1 text-xs font-extrabold rounded-full bg-emerald-600 text-white shadow-md">
                  Beginner
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  4.95
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                    UI/UX Design
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-500 transition-colors">
                    Modern UI/UX Design Systems with Tailwind & Figma
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
                    Build scalable, accessible, and delightful design systems used by modern high-growth tech companies.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Elena Rostova</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    Start Learning <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div
              onClick={() => onExploreCourse('course-cyber-security')}
              className="group cursor-pointer rounded-3xl overflow-hidden bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 shadow-sm hover:shadow-xl transition-all flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"
                  alt="Cybersecurity Fundamentals"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-3 py-1 text-xs font-extrabold rounded-full bg-rose-600 text-white shadow-md">
                  Intermediate
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  4.92
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-2">
                    Cybersecurity
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-500 transition-colors">
                    Cybersecurity & Threat Defense for Modern Applications
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
                    Defend web apps against OWASP Top 10 vulnerabilities, zero-day attacks, and supply-chain compromises.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Marcus Vance</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    Start Learning <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-950 text-white text-center relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mx-auto mb-6">
            <Flame className="w-8 h-8 text-orange-400 fill-orange-400 animate-pulse-subtle" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-4">
            Your Daily Learning Streak Starts Today.
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of curious software engineers, designers, and builders who turn small 15-minute daily sessions into mastery.
          </p>
          <button
            onClick={handleStart}
            className="px-8 py-4 rounded-2xl font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:opacity-95 shadow-xl shadow-amber-500/25 transition-all text-base"
          >
            {user ? 'Enter Your Learning Dashboard' : 'Claim Your Free Account Now'}
          </button>
        </div>
      </section>
    </div>
  );
};
