import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Award, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { triggerConfetti } from '../../utils/confetti';

export const LevelUpModal: React.FC = () => {
  const { levelUpInfo, closeLevelUpModal } = useAuth();

  if (!levelUpInfo.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-8 text-center bg-white dark:bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden">
        {/* Glowing background halo */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Level Icon Badge */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-1 flex items-center justify-center shadow-lg shadow-indigo-500/40 animate-bounce-subtle">
              <div className="w-full h-full bg-slate-950 rounded-xl flex flex-col items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-400 mb-1" />
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                  LVL {levelUpInfo.newLevel}
                </span>
              </div>
            </div>
            <span className="absolute -bottom-2 px-3 py-0.5 text-xs font-bold tracking-wider uppercase bg-amber-500 text-slate-950 rounded-full shadow-md">
              Level Up!
            </span>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Incredible Progress!
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base mb-6">
            You reached <span className="font-semibold text-indigo-500 dark:text-indigo-400">{levelUpInfo.newTitle}</span>! Your consistency is paying off.
          </p>

          <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-700/60 text-left">
            <div className="flex items-center gap-3 mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Unlocked Perks:</span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-6 list-disc">
              <li>+20 XP bonus multiplier on daily streaks</li>
              <li>Exclusive "{levelUpInfo.newTitle}" profile banner badge</li>
              <li>Priority access to advanced AI learning modules</li>
            </ul>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                triggerConfetti();
                closeLevelUpModal();
              }}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Keep Crushing It!</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
