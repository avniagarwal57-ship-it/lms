import React, { useState, useEffect } from 'react';
import { FlashcardDeck, Flashcard } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  RotateCw,
  Check,
  X,
  Sparkles,
  Zap,
  Trophy,
  RotateCcw,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { playSuccessSound, playXpSound } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

interface FlashcardsPageProps {
  deckId: string;
  onBack: () => void;
  onFinish: () => void;
}

export const FlashcardsPage: React.FC<FlashcardsPageProps> = ({ deckId, onBack, onFinish }) => {
  const { soundEnabled, updateUserXpLocally, user } = useAuth();
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    fetchDeck();
  }, [deckId]);

  const fetchDeck = async () => {
    try {
      const res = await fetch(`/api/flashcards/${deckId}`);
      if (res.ok) {
        const data = await res.json();
        setDeck(data.deck);
      }
    } catch (err) {
      console.error('Failed to load flashcard deck:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    playXpSound(soundEnabled);
    setIsFlipped(!isFlipped);
  };

  const handleNext = (mastered: boolean) => {
    if (!deck) return;
    if (mastered) {
      setMasteredCount(prev => prev + 1);
    } else {
      setReviewCount(prev => prev + 1);
    }

    setIsFlipped(false);
    if (currentIndex < deck.cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
      playSuccessSound(soundEnabled);
      triggerConfetti();
      updateUserXpLocally(35, false, user?.level || 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredCount(0);
    setReviewCount(0);
    setIsComplete(false);
  };

  if (loading || !deck) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const currentCard = deck.cards[currentIndex];
  const totalCards = deck.cards.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalCards) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lesson</span>
        </button>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/30">
          Card {currentIndex + 1} of {totalCards}
        </span>
      </div>

      {!isComplete ? (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={handleFlip}
            className="w-full h-80 sm:h-96 cursor-pointer perspective-1000 group"
          >
            <div
              className={`relative w-full h-full rounded-3xl transition-transform duration-500 transform-style-preserve-3d shadow-xl border border-slate-200 dark:border-slate-800 ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front Side */}
              <div className="absolute inset-0 w-full h-full rounded-3xl p-8 flex flex-col justify-between backface-hidden bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    {currentCard.tag || 'Concept'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    Click to flip
                  </span>
                </div>

                <div className="text-center my-auto">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
                    {currentCard.front}
                  </h3>
                </div>

                <div className="text-center text-xs text-slate-400">
                  Tap card or press Space to see definition
                </div>
              </div>

              {/* Back Side (Rotated 180) */}
              <div className="absolute inset-0 w-full h-full rounded-3xl p-8 flex flex-col justify-between backface-hidden rotate-y-180 bg-gradient-to-tr from-indigo-950 via-slate-900 to-purple-950 text-white border border-indigo-500/30">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-500/20 text-pink-400">
                    Definition & Insight
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    Click to flip back
                  </span>
                </div>

                <div className="text-center my-auto">
                  <p className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed">
                    {currentCard.back}
                  </p>
                </div>

                <div className="text-center text-xs text-slate-400">
                  Rate your recall below to advance
                </div>
              </div>
            </div>
          </div>

          {/* Spaced Repetition Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleNext(false)}
              className="py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Still Learning</span>
            </button>
            <button
              onClick={() => handleNext(true)}
              className="py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Mastered!</span>
            </button>
          </div>
        </div>
      ) : (
        /* Completion Screen */
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-pink-600/30">
            <Trophy className="w-10 h-10 text-amber-300 animate-bounce-subtle" />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Flashcard Deck Completed! 🧠
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              You reviewed <strong className="text-indigo-600 dark:text-indigo-400">{totalCards} cards</strong>. 
              Mastered {masteredCount} on first pass!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-sm inline-flex items-center gap-2">
            <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
            <span>+35 XP Earned!</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleRestart}
              className="flex-1 py-3.5 px-6 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Review Again</span>
            </button>
            <button
              onClick={onFinish}
              className="flex-1 py-3.5 px-6 rounded-xl font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <span>Back to Course</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
