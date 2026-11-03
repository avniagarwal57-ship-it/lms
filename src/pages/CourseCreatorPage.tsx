import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  PlayCircle,
  FileText,
  Award,
  Layers,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { playSuccessSound } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

interface CourseCreatorPageProps {
  onBack: () => void;
  onCourseCreated: (courseId: string) => void;
}

export const CourseCreatorPage: React.FC<CourseCreatorPageProps> = ({
  onBack,
  onCourseCreated,
}) => {
  const { soundEnabled } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('AI & Machine Learning');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState(
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'
  );

  // Chapters & lessons state
  const [chapters, setChapters] = useState([
    {
      id: 'ch-new-1',
      title: 'Chapter 1: Foundations & Architecture',
      lessons: [
        {
          id: 'les-new-1',
          title: 'Module Overview & Setup',
          type: 'video',
          durationMinutes: 12,
          xpReward: 25,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          markdownContent: '# Welcome to this course!\nMaster the fundamentals through interactive code.',
        },
        {
          id: 'les-new-2',
          title: 'Core Concepts & Best Practices',
          type: 'text',
          durationMinutes: 15,
          xpReward: 30,
          markdownContent: '# Core Architectural Decisions\nExplore real-world patterns and tradeoffs.',
        },
      ],
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addChapter = () => {
    const chNum = chapters.length + 1;
    setChapters(prev => [
      ...prev,
      {
        id: `ch-new-${Date.now()}`,
        title: `Chapter ${chNum}: Advanced Implementation`,
        lessons: [
          {
            id: `les-new-${Date.now()}`,
            title: 'Deep Dive & Practical Exercises',
            type: 'text',
            durationMinutes: 15,
            xpReward: 30,
            markdownContent: '# Lesson Notes\nWrite your curriculum here.',
          },
        ],
      },
    ]);
  };

  const removeChapter = (chapterId: string) => {
    if (chapters.length <= 1) return;
    setChapters(prev => prev.filter(c => c.id !== chapterId));
  };

  const addLesson = (chapterId: string) => {
    setChapters(prev =>
      prev.map(ch => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            lessons: [
              ...ch.lessons,
              {
                id: `les-new-${Date.now()}`,
                title: 'New Lesson Title',
                type: 'text',
                durationMinutes: 10,
                xpReward: 25,
                markdownContent: '# Lesson Content\nAdd your interactive text and instructions.',
              },
            ],
          };
        }
        return ch;
      })
    );
  };

  const removeLesson = (chapterId: string, lessonId: string) => {
    setChapters(prev =>
      prev.map(ch => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            lessons: ch.lessons.filter(l => l.id !== lessonId),
          };
        }
        return ch;
      })
    );
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Please provide a course title and full description.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          shortDescription: shortDescription || description.slice(0, 120) + '...',
          description,
          category,
          level,
          durationMinutes: Number(durationMinutes),
          thumbnail,
          chapters,
          learningOutcomes: [
            'Architect scalable and maintainable solutions',
            'Understand foundational patterns and industry best practices',
            'Deploy hands-on projects with full confidence',
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        playSuccessSound(soundEnabled);
        triggerConfetti();
        onCourseCreated(data.course.id);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to create course');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while publishing.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Instructor Studio</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-purple-500">
          Curriculum Builder
        </span>
      </div>

      <form onSubmit={handlePublish} className="space-y-8">
        {/* Course Info Card */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Course Fundamentals
              </h2>
              <p className="text-xs text-slate-400">
                Define the high-level metadata, categorization, and visual presentation.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Next-Gen Distributed Vector Search with TypeScript"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Full-Stack Web Dev">Full-Stack Web Dev</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Est. Minutes
                </label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Thumbnail Image URL
              </label>
              <input
                type="url"
                value={thumbnail}
                onChange={e => setThumbnail(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Course Description *
              </label>
              <textarea
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="Detailed syllabus description explaining outcomes, methodology, and prerequisites..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Chapters & Lessons Builder */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Course Curriculum & Modules
              </h2>
              <p className="text-xs text-slate-400">
                Organize your curriculum into progressive chapters and interactive lessons.
              </p>
            </div>

            <button
              type="button"
              onClick={addChapter}
              className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Chapter</span>
            </button>
          </div>

          <div className="space-y-6">
            {chapters.map((chapter, chIdx) => (
              <div
                key={chapter.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={e => {
                        const val = e.target.value;
                        setChapters(prev =>
                          prev.map(c => (c.id === chapter.id ? { ...c, title: val } : c))
                        );
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-transparent border-b border-slate-200 dark:border-slate-700 font-extrabold text-base text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  {chapters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChapter(chapter.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Lesson List */}
                <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-indigo-500/30">
                  {chapter.lessons.map((lesson, lIdx) => (
                    <div
                      key={lesson.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={e => {
                            const val = e.target.value;
                            setChapters(prev =>
                              prev.map(c => {
                                if (c.id === chapter.id) {
                                  return {
                                    ...c,
                                    lessons: c.lessons.map(l =>
                                      l.id === lesson.id ? { ...l, title: val } : l
                                    ),
                                  };
                                }
                                return c;
                              })
                            );
                          }}
                          placeholder="Lesson Title"
                          className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                        />

                        <select
                          value={lesson.type}
                          onChange={e => {
                            const val = e.target.value;
                            setChapters(prev =>
                              prev.map(c => {
                                if (c.id === chapter.id) {
                                  return {
                                    ...c,
                                    lessons: c.lessons.map(l =>
                                      l.id === lesson.id ? { ...l, type: val as any } : l
                                    ),
                                  };
                                }
                                return c;
                              })
                            );
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        >
                          <option value="video">Video Lesson</option>
                          <option value="text">Interactive Text</option>
                          <option value="quiz">Assessment Quiz</option>
                          <option value="assignment">Assignment</option>
                        </select>

                        {chapter.lessons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLesson(chapter.id, lesson.id)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>XP Reward: +{lesson.xpReward} XP</span>
                        <span>Duration: {lesson.durationMinutes} mins</span>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addLesson(chapter.id)}
                    className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1 pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Lesson to {chapter.title.split(':')[0]}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 text-xs sm:text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>{saving ? 'Publishing Course...' : 'Publish Course to Catalog'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
