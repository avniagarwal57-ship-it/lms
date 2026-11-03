import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Key,
  Shield,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  Bell,
  RotateCcw,
} from 'lucide-react';
import { playSuccessSound, playLevelUpSound } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, soundEnabled, toggleSound } = useAuth();
  const [geminiKey, setGeminiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setHasExistingKey(data.hasGeminiKey);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKey(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: geminiKey.trim() }),
      });

      if (res.ok) {
        setHasExistingKey(Boolean(geminiKey.trim()));
        setSavedSuccess(true);
        playSuccessSound(soundEnabled);
        triggerConfetti();
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save API key:', err);
    } finally {
      setSavingKey(false);
    }
  };

  const handleTestAudio = () => {
    playLevelUpSound(soundEnabled);
    triggerConfetti();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Application Settings
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Customize your sensory experience, AI connectivity, and learning preferences.
        </p>
      </div>

      {/* Preferences Section */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          <span>Interface & Audio Experience</span>
        </h2>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-indigo-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Color Theme</div>
              <div className="text-xs text-slate-500 capitalize">Currently {theme} mode</div>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-indigo-500 transition-colors"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
        </div>

        {/* Sound Effects Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-indigo-500" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Gamified Micro-Sound Effects
              </div>
              <div className="text-xs text-slate-500">
                Synthesized Web Audio chimes for XP, streaks, and level-ups
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestAudio}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
            >
              Test Sound 🎵
            </button>
            <button
              onClick={toggleSound}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                soundEnabled
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Configuration */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-pink-500" />
            <span>AI Tutor Backend Configuration</span>
          </h2>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            hasExistingKey
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
          }`}>
            {hasExistingKey ? 'Live Gemini AI Connected' : 'Contextual Demo Mode Active'}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Lumina AI connects to Google Gemini 1.5 Flash. When an API key is saved, live model inference is used. If no key is set, the application operates in <strong>Contextual Demo Mode</strong> with pre-computed expert answers.
        </p>

        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>API configuration saved successfully! Lumina is ready.</span>
          </div>
        )}

        <form onSubmit={handleSaveApiKey} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                placeholder={hasExistingKey ? '•••••••••••••••••••••••• (Key Configured)' : 'AIzaSy...'}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {hasExistingKey && (
              <button
                type="button"
                onClick={() => {
                  setGeminiKey('');
                  handleSaveApiKey({ preventDefault: () => {} } as any);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-500"
              >
                Clear Key (Revert to Demo Mode)
              </button>
            )}
            <button
              type="submit"
              disabled={savingKey}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-500 shadow-md shadow-pink-600/30 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{savingKey ? 'Connecting...' : 'Save & Verify Key'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
