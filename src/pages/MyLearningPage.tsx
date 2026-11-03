import React, { useState, useEffect } from 'react';
import { Enrollment, Course, Note, LearningPath } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Award,
  PlayCircle,
  Clock,
  Sparkles,
  Route,
  ArrowRight,
  Download,
  CheckCircle2,
  Trash2,
  FileText,
  X,
} from 'lucide-react';
import { triggerConfetti } from '../utils/confetti';

interface MyLearningPageProps {
  onStartLesson: (courseId: string, lessonId: string) => void;
  onExploreCourses: () => void;
}

export const MyLearningPage: React.FC<MyLearningPageProps> = ({
  onStartLesson,
  onExploreCourses,
}) => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed' | 'paths' | 'notes'>('in-progress');
  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyLearningData();
  }, [user]);

  const fetchMyLearningData = async () => {
    try {
      const [enrollRes, pathsRes, notesRes] = await Promise.all([
        fetch('/api/enrollments/my'),
        fetch('/api/learning-paths'),
        fetch('/api/notes'),
      ]);

      if (enrollRes.ok) {
        const data = await enrollRes.json();
        setEnrollments(data.enrollments || []);
      }
      if (pathsRes.ok) {
        const data = await pathsRes.json();
        setLearningPaths(data.learningPaths || []);
      }
      if (notesRes.ok) {
        const data = await notesRes.json();
        setNotes(data.notes || []);
      }
    } catch (err) {
      console.error('Failed to load my learning data:', err);
    } finally {
      setLoading(false);
    }
  };

  const inProgressCourses = enrollments.filter(e => e.progressPercentage < 100);
  const completedCourses = enrollments.filter(e => e.progressPercentage >= 100);

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          My Learning Center
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Track your course completions, certified credentials, and personal notes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs sm:text-sm font-bold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('in-progress')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'in-progress'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>In Progress ({inProgressCourses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Completed & Certificates ({completedCourses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('paths')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'paths'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Route className="w-4 h-4" />
          <span>Learning Tracks ({learningPaths.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'notes'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Notes ({notes.length})</span>
        </button>
      </div>

      {/* Tab 1: In Progress */}
      {activeTab === 'in-progress' && (
        <div className="space-y-6">
          {inProgressCourses.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No active courses right now
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Explore our catalog and start an exciting gamified track!
              </p>
              <button
                onClick={onExploreCourses}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 shadow-md"
              >
                Explore Courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressCourses.map(enrollment => {
                const course = enrollment.course;
                if (!course) return null;
                const resumeLessonId = enrollment.lastLessonId || course.chapters[0]?.lessons[0]?.id;

                return (
                  <div
                    key={enrollment.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-40 rounded-2xl overflow-hidden mb-4">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-950/80 text-white">
                          {course.level}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                        {course.category}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 mb-2">
                        {course.title}
                      </h3>

                      {/* Progress bar */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-500">Progress</span>
                          <span className="text-indigo-600 dark:text-indigo-400">
                            {enrollment.progressPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${enrollment.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onStartLesson(course.id, resumeLessonId)}
                      className="w-full py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Resume Learning</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Completed Courses & Certificates */}
      {activeTab === 'completed' && (
        <div className="space-y-6">
          {completedCourses.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <Award className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No completed courses yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Complete all lessons in a course to earn official verifiable certificates of completion!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedCourses.map(enrollment => {
                const course = enrollment.course;
                if (!course) return null;
                return (
                  <div
                    key={enrollment.id}
                    className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-slate-900/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center gap-6 shadow-sm"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                      <Award className="w-8 h-8" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-emerald-500 mb-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>100% Completed</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Issued on {new Date(enrollment.lastAccessedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCertificate({ course, enrollment });
                        triggerConfetti();
                      }}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all shrink-0"
                    >
                      View Certificate
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Learning Paths */}
      {activeTab === 'paths' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningPaths.map(path => (
            <div
              key={path.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Route className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                    {path.category}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {path.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {path.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Outcome: {path.targetRole}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {path.skillsGained.map(skill => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: My Saved Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No personal notes recorded yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Open any lesson and use the "My Notes" tab to take quick study notes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map(note => (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {note.lessonTitle}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {note.text}
                  </p>
                  <div className="text-[10px] text-slate-400">
                    Saved on {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-950 border-4 border-amber-400/60 rounded-3xl p-8 sm:p-12 text-center shadow-2xl overflow-hidden">
            <button
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing seal watermark */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-400/30">
              <Award className="w-10 h-10" />
            </div>

            <div className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">
              QuestLearn Certificate of Completion
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
              Certificate of Mastery
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              This officially certifies that
            </p>

            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-serif mb-4">
              {user?.name || 'Alex Rivers'}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6">
              has successfully fulfilled all curriculum, quiz assessments, and hands-on laboratory requirements for:
            </p>

            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-8">
              "{selectedCertificate.course.title}"
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-6">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{selectedCertificate.course.instructorName}</div>
                <div className="text-[10px]">Lead Instructor</div>
              </div>
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">Credential ID: QL-{selectedCertificate.enrollment.id.slice(0, 8).toUpperCase()}</div>
                <div className="text-[10px]">Verified by QuestLearn Protocol</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
