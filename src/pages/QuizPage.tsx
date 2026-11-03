import React, { useState, useEffect } from 'react';
import { Quiz, Question } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  Zap,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Trophy,
} from 'lucide-react';
import { playSuccessSound, playXpSound } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

interface QuizPageProps {
  quizId: string;
  onBack: () => void;
  onFinish: () => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({ quizId, onBack, onFinish }) => {
  const { user, soundEnabled, updateUserXpLocally } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}`);
      if (res.ok) {
        const data = await res.json();
        setQuiz(data.quiz);
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNextQuestion = () => {
    if (!quiz) return;
    setShowHint(false);
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: selectedAnswers }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setSubmitted(true);

        if (data.passed) {
          playSuccessSound(soundEnabled);
          triggerConfetti();
          if (data.xpAwarded) {
            updateUserXpLocally(data.xpAwarded, data.leveledUp, data.newLevel);
          }
        }
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setSubmitted(false);
    setResults(null);
    setShowHint(false);
  };

  if (loading || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Quiz</span>
        </button>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          Passing Score: {quiz.passingScore}%
        </span>
      </div>

      {!submitted ? (
        <div className="space-y-6">
          {/* Progress Bar & Question Counter */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.questionText}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(currentQ.id, idx)}
                    className={`w-full p-4 rounded-2xl text-left text-sm font-semibold border-2 transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-white shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Hint Box */}
            {currentQ.hint && (
              <div className="pt-2">
                {showHint ? (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Lumina's Hint:</strong> {currentQ.hint}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-amber-500 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Need a hint?</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Next Button */}
          <div className="flex justify-end">
            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswers[currentQ.id] === undefined}
              className="px-8 py-3.5 rounded-2xl font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <span>{currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Submit Assessment'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Results Screen */
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-indigo-600/30">
            {results?.passed ? (
              <Trophy className="w-10 h-10 text-amber-300 animate-bounce-subtle" />
            ) : (
              <XCircle className="w-10 h-10 text-rose-300" />
            )}
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {results?.passed ? 'Assessment Passed! 🎉' : 'Keep Practicing!'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              You scored <strong className="text-indigo-600 dark:text-indigo-400">{results?.scorePercentage}%</strong> ({results?.correctCount} out of {results?.totalQuestions} correct)
            </p>
          </div>

          {results?.passed && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-sm inline-flex items-center gap-2">
              <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
              <span>+{results?.xpAwarded} XP Earned!</span>
            </div>
          )}

          {/* Detailed Question Review */}
          <div className="space-y-3 text-left pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Detailed Breakdown & Explanations:
            </h3>
            {results?.feedback?.map((item: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border text-xs space-y-1 ${
                  item.isCorrect
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 text-slate-800 dark:text-slate-200'
                    : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/30 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                  <span>Question {idx + 1}: {item.isCorrect ? 'Correct!' : 'Incorrect'}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 pl-6">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleRetake}
              className="flex-1 py-3.5 px-6 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={onFinish}
              className="flex-1 py-3.5 px-6 rounded-xl font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
