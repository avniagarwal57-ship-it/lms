import React, { useState, useEffect } from 'react';
import { Course, Submission } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Users,
  Star,
  Award,
  FileCheck2,
  Clock,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  X,
  Send,
} from 'lucide-react';
import { playSuccessSound } from '../utils/sound';

interface InstructorDashboardPageProps {
  onCreateCourse: () => void;
  onSelectCourse: (courseId: string) => void;
}

export const InstructorDashboardPage: React.FC<InstructorDashboardPageProps> = ({
  onCreateCourse,
  onSelectCourse,
}) => {
  const { user, soundEnabled } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Grading modal state
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState(90);
  const [gradeFeedback, setGradeFeedback] = useState('Excellent implementation of the ReAct agent dispatcher loop!');
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    fetchInstructorData();
  }, [user]);

  const fetchInstructorData = async () => {
    try {
      const [coursesRes, subsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/instructor/submissions'),
      ]);

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data.courses || []);
      }
      if (subsRes.ok) {
        const subsData = await subsRes.json();
        setSubmissions(subsData.submissions || []);
      }
    } catch (err) {
      console.error('Failed to load instructor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async () => {
    if (!activeSubmission) return;
    setGrading(true);

    try {
      const res = await fetch(`/api/instructor/grade/${activeSubmission.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: gradeScore, feedback: gradeFeedback }),
      });

      if (res.ok) {
        const data = await res.json();
        playSuccessSound(soundEnabled);
        setSubmissions(prev =>
          prev.map(s => (s.id === activeSubmission.id ? data.submission : s))
        );
        setActiveSubmission(null);
      }
    } catch (err) {
      console.error('Failed to grade submission:', err);
    } finally {
      setGrading(false);
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const totalStudents = courses.reduce((acc, c) => acc + (c.enrollmentsCount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/50 border border-purple-500/20 backdrop-blur-md">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Instructor Studio
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Course Management & Grading
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Welcome, {user?.name}. Monitor enrolled students, grade laboratory assignments, and publish new curricula.
          </p>
        </div>

        <button
          onClick={onCreateCourse}
          className="px-6 py-3.5 rounded-2xl font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Total Students</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalStudents.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-500 font-bold">+18% this month</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Published Courses</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {courses.length}
            </div>
            <div className="text-[10px] text-purple-400 font-bold">All live in catalog</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Average Rating</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              4.91 / 5
            </div>
            <div className="text-[10px] text-amber-500 font-bold">From 885 reviews</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Pending Reviews</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {pendingSubmissions.length}
            </div>
            <div className="text-[10px] text-rose-500 font-bold">Needs feedback</div>
          </div>
        </div>
      </div>

      {/* Pending Student Submissions Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Assignment Submission Queue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review code and practical submissions submitted by learners.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {submissions.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No assignment submissions right now.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {submissions.map(sub => (
                <div
                  key={sub.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={sub.studentAvatar}
                      alt={sub.studentName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {sub.studentName}
                      </div>
                      <div className="text-xs text-slate-500">
                        Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      sub.status === 'graded'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {sub.status === 'graded' ? `Graded (${sub.score}/100)` : 'Pending Review'}
                    </span>

                    <button
                      onClick={() => setActiveSubmission(sub)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-sm"
                    >
                      {sub.status === 'graded' ? 'Update Grade' : 'Review & Grade'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Courses Catalog Manager */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Active Course Catalog
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div
              key={course.id}
              onClick={() => onSelectCourse(course.id)}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
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
                <div className="text-xs font-bold text-indigo-500 mb-1">{course.category}</div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 mb-2">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {course.shortDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>{course.enrollmentsCount} students</span>
                <span className="text-indigo-500 font-bold group-hover:underline flex items-center gap-1">
                  View Syllabus <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grading Review Modal */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Review Submission: {activeSubmission.studentName}
                </h3>
                <span className="text-xs text-slate-400">Course Assignment</span>
              </div>
              <button
                onClick={() => setActiveSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Code Box */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-400">
                Student Code Solution:
              </label>
              <pre className="p-4 rounded-2xl bg-slate-950 text-indigo-300 font-mono text-xs overflow-x-auto max-h-52 border border-slate-800">
                {activeSubmission.content}
              </pre>
            </div>

            {/* Score & Feedback Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Score (0 - 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeScore}
                  onChange={e => setGradeScore(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Instructor Feedback
                </label>
                <input
                  type="text"
                  value={gradeFeedback}
                  onChange={e => setGradeFeedback(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveSubmission(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleGrade}
                disabled={grading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{grading ? 'Submitting...' : 'Save & Publish Grade'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
