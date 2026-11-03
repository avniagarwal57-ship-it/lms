import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  HelpCircle,
  BookOpen,
  Calendar,
  Layers,
  Code,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { playXpSound } from '../utils/sound';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  source?: string;
}

export const AiTutorPage: React.FC = () => {
  const { user, soundEnabled } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Hello ${user?.name.split(' ')[0] || 'friend'}! I'm **Lumina**, your personal AI Learning Assistant on QuestLearn.

I'm here to help you master challenging topics, break down complex concepts into simple intuition, generate practice problems, or architect a personalized study schedule.

Try one of the guided prompts below or ask me any question!`,
      source: 'contextual-demo-mode',
    },
  ]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLiveGemini, setIsLiveGemini] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    checkSettings();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const checkSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setIsLiveGemini(data.hasGeminiKey);
      }
    } catch (err) {
      console.error('Failed to check settings:', err);
    }
  };

  const handleSend = async (userPrompt: string, mode: string = 'general') => {
    if (!userPrompt.trim()) return;

    const newMsg: Message = { role: 'user', text: userPrompt };
    setMessages(prev => [...prev, newMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          mode,
          courseTitle: 'Full-Stack AI Engineering & Systems Design',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        playXpSound(soundEnabled);
        setMessages(prev => [
          ...prev,
          { role: 'assistant', text: data.reply, source: data.source },
        ]);
        if (data.source === 'gemini-live') {
          setIsLiveGemini(true);
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Encountered a connection error. Please try again!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/50 border border-purple-500/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Lumina AI Learning Assistant
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isLiveGemini
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {isLiveGemini ? '● Live Gemini Active' : '● Demo Tutor Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Trained on modern AI architectures, software engineering, and design systems.
            </p>
          </div>
        </div>

        {!isLiveGemini && (
          <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl max-w-xs">
            💡 Using intelligent context simulation. Add a Google Gemini API key in <strong>Settings</strong> to connect live AI!
          </div>
        )}
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button
          onClick={() => handleSend('Explain vector embeddings in simple everyday terms (ELI5)', 'explain')}
          className="p-3 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-500 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all flex items-center gap-2 group"
        >
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
          <span>Explain like I'm 5</span>
        </button>

        <button
          onClick={() => handleSend('Show me a real-world code example of cosine similarity with Spotify music matching', 'example')}
          className="p-3 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 hover:border-purple-500 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all flex items-center gap-2 group"
        >
          <Code className="w-4 h-4 text-purple-500 shrink-0 group-hover:scale-110 transition-transform" />
          <span>Production Code Example</span>
        </button>

        <button
          onClick={() => handleSend('Generate 3 quick practice questions to test my RAG & Vector understanding', 'quiz')}
          className="p-3 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 hover:border-pink-500 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all flex items-center gap-2 group"
        >
          <HelpCircle className="w-4 h-4 text-pink-500 shrink-0 group-hover:scale-110 transition-transform" />
          <span>Generate Practice Quiz</span>
        </button>

        <button
          onClick={() => handleSend('Create a structured 4-week learning roadmap for transitioning into an AI Systems Architect', 'plan')}
          className="p-3 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-500 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all flex items-center gap-2 group"
        >
          <Calendar className="w-4 h-4 text-indigo-500 shrink-0 group-hover:scale-110 transition-transform" />
          <span>4-Week Custom Study Plan</span>
        </button>

        <button
          onClick={() => handleSend('Summarize the top 3 architectural trade-offs between dense vector search vs keyword search', 'summary')}
          className="p-3 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-500 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all flex items-center gap-2 group"
        >
          <BookOpen className="w-4 h-4 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
          <span>Key Trade-Offs Summary</span>
        </button>

        <button
          onClick={() => handleSend('What are common weak spots developers have when designing autonomous agents?', 'general')}
          className="p-3 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 hover:border-rose-500 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all flex items-center gap-2 group"
        >
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 group-hover:scale-110 transition-transform" />
          <span>Identify Weak Spots</span>
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl min-h-[440px] flex flex-col justify-between space-y-4">
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                {m.source && (
                  <div className="mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-700/40 text-[10px] text-slate-400">
                    Source: {m.source === 'gemini-live' ? 'Live Gemini 1.5 Flash' : 'QuestLearn Contextual Knowledge Engine'}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-400 italic">
              <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <span>Lumina is researching and formatting your answer...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend(prompt);
          }}
          className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800"
        >
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ask Lumina anything about programming, AI, design, or your study routine..."
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white disabled:opacity-50 shadow-md transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
