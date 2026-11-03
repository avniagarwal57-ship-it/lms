import React, { useState, useEffect, useRef } from 'react';
import { Course, Lesson, Note } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle2,
  Bot,
  Bookmark,
  FileText,
  Download,
  Share2,
  Sparkles,
  Zap,
  ChevronRight,
  ChevronLeft,
  Send,
  HelpCircle,
  Copy,
  Check,
  Award,
  Layers,
  BookOpen,
  MessageSquare,
  X,
} from 'lucide-react';
import { playSuccessSound, playXpSound } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

interface LessonPlayerPageProps {
  courseId: string;
  lessonId: string;
  onBack: () => void;
  onNavigateLesson: (newLessonId: string) => void;
  onOpenQuiz: (quizId: string) => void;
  onOpenFlashcards: (deckId: string) => void;
}

export const LessonPlayerPage: React.FC<LessonPlayerPageProps> = ({
  courseId,
  lessonId,
  onBack,
  onNavigateLesson,
  onOpenQuiz,
  onOpenFlashcards,
}) => {
  const { user, soundEnabled, updateUserXpLocally } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Video player state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoProgress, setVideoProgress] = useState(0);
  const [theaterMode, setTheaterMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'transcript' | 'notes' | 'resources'>('content');

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // AI Tutor sidebar state
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; mode?: string }>>([
    {
      role: 'assistant',
      text: `Hi ${user?.name.split(' ')[0] || 'there'}! I'm **Lumina**, your personal AI tutor. Ask me anything about this lesson or click a quick prompt below for simple analogies, real-world examples, or hints!`,
    },
  ]);

  // Assignment submission state
  const [assignmentCode, setAssignmentCode] = useState(`// Implement your tool calling agent here
export async function runAgent(input: string) {
  // your solution
  return { status: "success", result: "Agent executed successfully" };
}`);
  const [submittedAssignment, setSubmittedAssignment] = useState(false);

  // Copied code feedback
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchCourseAndLesson();
  }, [courseId, lessonId]);

  const fetchCourseAndLesson = async () => {
    try {
      const [cRes, notesRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/notes?courseId=${courseId}`),
      ]);

      if (cRes.ok) {
        const data = await cRes.json();
        setCourse(data.course);
        setCompletedLessonIds(data.enrollment?.completedLessonIds || []);

        const allLessons = data.course?.chapters?.flatMap((ch: any) => ch.lessons) || [];
        const found = allLessons.find((l: Lesson) => l.id === lessonId) || allLessons[0];
        setCurrentLesson(found);
      }

      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setNotes(notesData.notes || []);
      }
    } catch (err) {
      console.error('Failed to load lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  // Video player controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      setVideoProgress((current / duration) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (videoRef.current) {
      const duration = videoRef.current.duration || 1;
      videoRef.current.currentTime = (val / 100) * duration;
      setVideoProgress(val);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Lesson Completion
  const handleCompleteLesson = async () => {
    if (!currentLesson || !course) return;

    try {
      const res = await fetch('/api/progress/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          lessonId: currentLesson.id,
          xpReward: currentLesson.xpReward,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        playSuccessSound(soundEnabled);
        triggerConfetti();

        // Update local completed state
        setCompletedLessonIds(prev =>
          prev.includes(currentLesson.id) ? prev : [...prev, currentLesson.id]
        );

        // Update XP locally
        updateUserXpLocally(data.xpAwarded, data.leveledUp, data.newLevel);

        // Advance to next lesson after small pause
        const next = getNextLesson();
        if (next) {
          setTimeout(() => {
            onNavigateLesson(next.id);
          }, 1200);
        }
      }
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    }
  };

  // Notes actions
  const handleSaveNote = async () => {
    if (!newNoteText.trim() || !course || !currentLesson) return;
    setSavingNote(true);

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          lessonId: currentLesson.id,
          lessonTitle: currentLesson.title,
          text: newNoteText.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotes(prev => [data.note, ...prev]);
        setNewNoteText('');
        playXpSound(soundEnabled);
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  // AI Tutor Quick Action
  const askAiTutor = async (promptText: string, mode: string = 'explain') => {
    setAiSidebarOpen(true);
    setAiLoading(true);
    setAiChatHistory(prev => [...prev, { role: 'user', text: promptText, mode }]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          lessonTitle: currentLesson?.title,
          courseTitle: course?.title,
          mode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiChatHistory(prev => [...prev, { role: 'assistant', text: data.reply, mode: data.mode }]);
        playXpSound(soundEnabled);
      }
    } catch (err) {
      setAiChatHistory(prev => [
        ...prev,
        { role: 'assistant', text: 'Sorry, I ran into an issue processing that. Please try again!' },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Assignment submission
  const handleSubmitAssignment = async () => {
    if (!course || !currentLesson) return;
    try {
      const res = await fetch('/api/instructor/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: currentLesson.assignmentId || 'assign-1',
          lessonId: currentLesson.id,
          courseId: course.id,
          studentId: user?.id,
          studentName: user?.name,
          studentAvatar: user?.avatar,
          content: assignmentCode,
        }),
      });
      if (res.ok) {
        setSubmittedAssignment(true);
        playSuccessSound(soundEnabled);
        triggerConfetti();
        updateUserXpLocally(100, false, user?.level || 1);
      }
    } catch (err) {
      console.error('Failed to submit assignment:', err);
    }
  };

  // Navigation helpers
  const allLessons = course?.chapters.flatMap(ch => ch.lessons) || [];
  const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);
  const getPrevLesson = () => (currentIndex > 0 ? allLessons[currentIndex - 1] : null);
  const getNextLesson = () => (currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null);

  if (loading || !course || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isCurrentLessonCompleted = completedLessonIds.includes(currentLesson.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Syllabus</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick AI Tutor Toggle Button */}
          <button
            onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/30 hover:bg-pink-500/20 transition-all shadow-sm"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask Lumina AI</span>
          </button>

          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            +{currentLesson.xpReward} XP
          </span>
        </div>
      </div>

      {/* Main Grid: Player on left, Curriculum & Tools on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Player / Lesson Viewer */}
        <div className={`space-y-6 ${theaterMode ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          {/* VIDEO LESSON PLAYER */}
          {currentLesson.type === 'video' && (
            <div className="rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl relative group">
              <video
                ref={videoRef}
                src={currentLesson.videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleCompleteLesson}
                className="w-full h-[280px] sm:h-[420px] object-cover"
                poster={course.thumbnail}
                playsInline
              />

              {/* Custom Overlay Controls */}
              <div className="p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex flex-col gap-2">
                {/* Scrub bar */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={videoProgress}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-700 accent-indigo-500 rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>

                    {/* Speed options */}
                    <div className="flex items-center gap-1 text-[11px] font-bold">
                      {[1, 1.25, 1.5, 2].map(speed => (
                        <button
                          key={speed}
                          onClick={() => changeSpeed(speed)}
                          className={`px-2 py-0.5 rounded-md transition-colors ${
                            playbackSpeed === speed ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTheaterMode(!theaterMode)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                      title="Toggle Theater Mode"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TEXT / NOTION STYLE LESSON */}
          {currentLesson.type === 'text' && (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                <FileText className="w-4 h-4" />
                <span>Text-Based Deep Dive</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {currentLesson.title}
              </h1>

              {/* Formatted Markdown Content */}
              <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
                <div className="whitespace-pre-line">
                  {currentLesson.markdownContent}
                </div>
              </div>
            </div>
          )}

          {/* QUIZ PROMPT CARD (if quiz type) */}
          {currentLesson.type === 'quiz' && (
            <div className="p-8 rounded-3xl bg-gradient-to-tr from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-500/30 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Knowledge Checkpoint
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {currentLesson.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
                  Earn +40 XP and unlock the "Quiz Prodigy" trophy by proving your mastery!
                </p>
              </div>

              <button
                onClick={() => onOpenQuiz(currentLesson.quizId || 'quiz-ai-1')}
                className="px-8 py-4 rounded-2xl font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 shadow-xl shadow-amber-500/25 transition-all text-sm inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Interactive Quiz Assessment</span>
              </button>
            </div>
          )}

          {/* FLASHCARD PROMPT CARD (if flashcard type) */}
          {currentLesson.type === 'flashcards' && (
            <div className="p-8 rounded-3xl bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/30 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/20 text-pink-500 flex items-center justify-center mx-auto shadow-lg shadow-pink-500/20">
                <Layers className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                  Memory Mastery
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {currentLesson.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
                  Drill key terminology with active recall flashcards.
                </p>
              </div>

              <button
                onClick={() => onOpenFlashcards(currentLesson.flashcardDeckId || 'deck-ai-1')}
                className="px-8 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 shadow-xl shadow-pink-500/25 transition-all text-sm inline-flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>Start Flashcard Session</span>
              </button>
            </div>
          )}

          {/* PRACTICAL ASSIGNMENT WORKBENCH (if assignment type) */}
          {currentLesson.type === 'assignment' && (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                  <span>Hands-on Project Assignment</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">
                  +100 XP
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {currentLesson.title}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300">
                Implement a functional tool-calling agent in TypeScript or Python. Test your code and submit below for instructor evaluation.
              </p>

              {/* Code Workbench */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono">agent-dispatcher.ts</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(assignmentCode);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="flex items-center gap-1 hover:text-indigo-500 transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Starter'}</span>
                  </button>
                </div>
                <textarea
                  value={assignmentCode}
                  onChange={e => setAssignmentCode(e.target.value)}
                  rows={8}
                  className="w-full p-4 rounded-2xl bg-slate-950 text-indigo-300 font-mono text-xs border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {submittedAssignment ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Assignment Submitted! Graded status will appear in your profile shortly. (+100 XP granted)</span>
                </div>
              ) : (
                <button
                  onClick={handleSubmitAssignment}
                  className="w-full py-3.5 rounded-xl font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Solution for Instructor Review</span>
                </button>
              )}
            </div>
          )}

          {/* Lesson Tabs: Notes & Resources & Transcript */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
              <button
                onClick={() => setActiveTab('content')}
                className={`transition-colors ${activeTab === 'content' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 pb-3 -mb-3.5' : 'text-slate-500'}`}
              >
                Lesson Overview
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-1.5 transition-colors ${activeTab === 'notes' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 pb-3 -mb-3.5' : 'text-slate-500'}`}
              >
                <span>My Notes</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-900/60">
                  {notes.length}
                </span>
              </button>
              {currentLesson.transcript && (
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`transition-colors ${activeTab === 'transcript' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 pb-3 -mb-3.5' : 'text-slate-500'}`}
                >
                  Transcript
                </button>
              )}
              {currentLesson.resources && (
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`transition-colors ${activeTab === 'resources' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 pb-3 -mb-3.5' : 'text-slate-500'}`}
                >
                  Downloads ({currentLesson.resources.length})
                </button>
              )}
            </div>

            {/* Tab: Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-4 pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    placeholder="Type a key takeaway or personal note for this lesson..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={e => e.key === 'Enter' && handleSaveNote()}
                  />
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote || !newNoteText.trim()}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all"
                  >
                    Save Note
                  </button>
                </div>

                <div className="space-y-2">
                  {notes.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No notes yet. Add one above to keep track of key concepts!
                    </div>
                  ) : (
                    notes.map(note => (
                      <div
                        key={note.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start justify-between gap-2 text-xs"
                      >
                        <p className="text-slate-700 dark:text-slate-300">{note.text}</p>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab: Transcript */}
            {activeTab === 'transcript' && currentLesson.transcript && (
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                {currentLesson.transcript}
              </div>
            )}

            {/* Tab: Resources */}
            {activeTab === 'resources' && currentLesson.resources && (
              <div className="space-y-2 pt-2">
                {currentLesson.resources.map(res => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-indigo-500" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{res.title}</span>
                      {res.size && <span className="text-slate-400">({res.size})</span>}
                    </div>
                    <a
                      href={res.url}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Overview */}
            {activeTab === 'content' && (
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 space-y-2">
                <p>
                  <strong>Lesson Objective:</strong> Gain deep intuition on {currentLesson.title}. Complete all interactive modules and quizzes to maximize your XP gain.
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                  <span>⏱ Duration: {currentLesson.durationMinutes} mins</span>
                  <span>🏆 XP Value: +{currentLesson.xpReward} XP</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Bar: Complete Lesson & Prev/Next */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => getPrevLesson() && onNavigateLesson(getPrevLesson()!.id)}
                disabled={!getPrevLesson()}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => getNextLesson() && onNavigateLesson(getNextLesson()!.id)}
                disabled={!getNextLesson()}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleCompleteLesson}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                isCurrentLessonCompleted
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white hover:opacity-95 shadow-indigo-600/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isCurrentLessonCompleted
                  ? 'Completed (+XP Claimed)'
                  : `Mark Complete & Earn +${currentLesson.xpReward} XP`}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Syllabus Drawer & AI Tutor Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Lumina AI Quick Drawer */}
          <div className="p-6 rounded-3xl bg-gradient-to-tr from-purple-900/30 via-indigo-900/30 to-pink-900/20 border border-purple-500/30 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-500/30">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Lumina AI Tutor
                  </h3>
                  <div className="text-[10px] text-pink-500 font-semibold">
                    Always ready to explain
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Prompt Pills */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
              <button
                onClick={() => askAiTutor('Can you explain this in simple terms with an analogy?', 'explain')}
                className="p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-left border border-slate-200/50 dark:border-slate-700/50 transition-all"
              >
                💡 Explain simply (ELI5)
              </button>
              <button
                onClick={() => askAiTutor('Give me a real-world production example of this concept', 'example')}
                className="p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-left border border-slate-200/50 dark:border-slate-700/50 transition-all"
              >
                🛠️ Real-world code
              </button>
              <button
                onClick={() => askAiTutor('Give me a subtle hint without spoiling the answer', 'hint')}
                className="p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-left border border-slate-200/50 dark:border-slate-700/50 transition-all"
              >
                🧭 Give me a hint
              </button>
              <button
                onClick={() => askAiTutor('Summarize the top 3 takeaways for this lesson', 'summary')}
                className="p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-left border border-slate-200/50 dark:border-slate-700/50 transition-all"
              >
                📝 Top 3 takeaways
              </button>
            </div>

            {/* Chat Messages */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 text-xs">
              {aiChatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white ml-6 text-right'
                      : 'bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 mr-4'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                </div>
              ))}
              {aiLoading && (
                <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 text-xs text-slate-400 italic animate-pulse">
                  Lumina is thinking...
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={e => {
                e.preventDefault();
                if (aiPrompt.trim()) {
                  askAiTutor(aiPrompt.trim());
                  setAiPrompt('');
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Ask Lumina anything..."
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="submit"
                disabled={aiLoading || !aiPrompt.trim()}
                className="p-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Curriculum Tree Sidebar */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Course Curriculum
            </h3>

            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {course.chapters.map((ch, idx) => (
                <div key={ch.id} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {ch.title}
                  </div>
                  <div className="space-y-1">
                    {ch.lessons.map(l => {
                      const active = l.id === currentLesson.id;
                      const completed = completedLessonIds.includes(l.id);
                      return (
                        <button
                          key={l.id}
                          onClick={() => onNavigateLesson(l.id)}
                          className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all ${
                            active
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {completed ? (
                              <CheckCircle2 className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-emerald-500'}`} />
                            ) : (
                              <span className={`w-2 h-2 rounded-full ${active ? 'bg-white' : 'bg-slate-400'}`} />
                            )}
                            <span className="truncate">{l.title}</span>
                          </div>
                          <span className={`text-[10px] shrink-0 ${active ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {l.durationMinutes}m
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
