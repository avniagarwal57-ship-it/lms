import React, { useState, useEffect } from 'react';
import { Course, Enrollment, Lesson } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Star,
  Clock,
  Users,
  CheckCircle2,
  PlayCircle,
  FileText,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  BookOpen,
} from 'lucide-react';
import { playSuccessSound } from '../utils/sound';

interface CourseDetailsPageProps {
  courseId: string;
  onBack: () => void;
  onStartLesson: (courseId: string, lessonId: string) => void;
}

export const CourseDetailsPage: React.FC<CourseDetailsPageProps> = ({
  courseId,
  onBack,
  onStartLesson,
}) => {
  const { user, soundEnabled } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openChapterIds, setOpenChapterIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId, user]);

  const fetchCourseDetails = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data.course);
        setEnrollment(data.enrollment);

        // Open first chapter by default
        if (data.course?.chapters?.length > 0) {
          setOpenChapterIds({ [data.course.chapters[0].id]: true });
        }
      }
    } catch (err) {
      console.error('Failed to load course details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      const res = await fetch(`/api/enrollments/${course.id}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setEnrollment(data.enrollment);
        playSuccessSound(soundEnabled);

        // Auto jump to first lesson
        const firstLesson = course.chapters[0]?.lessons[0];
        if (firstLesson) {
          onStartLesson(course.id, firstLesson.id);
        }
      }
    } catch (err) {
      console.error('Failed to enroll:', err);
    } finally {
      setEnrolling(false);
    }
  };

  const toggleChapter = (chapterId: string) => {
    setOpenChapterIds(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-4 h-4 text-indigo-500" />;
      case 'text':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'quiz':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'flashcards':
        return <Layers className="w-4 h-4 text-pink-500" />;
      case 'assignment':
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
    }
  };

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const allLessons = course.chapters.flatMap(ch => ch.lessons);
  const totalXp = allLessons.reduce((sum, l) => sum + (l.xpReward || 20), 0);
  const isCompleted = (lessonId: string) => enrollment?.completedLessonIds.includes(lessonId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Courses</span>
      </button>

      {/* Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {course.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {course.level}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
                {course.rating} ({course.reviewsCount} reviews)
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {course.description}
            </p>

            {/* Instructor badge */}
            <div className="flex items-center gap-3 pt-2">
              <img
                src={course.instructorAvatar}
                alt={course.instructorName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {course.instructorName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {course.instructorTitle}
                </div>
              </div>
            </div>
          </div>

          {/* Action / Enrollment Box */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="relative rounded-xl overflow-hidden h-40 shadow-md">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Quick stats */}
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Duration</span>
                <span className="font-bold">{course.durationMinutes} minutes</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Total XP Reward</span>
                <span className="font-bold text-amber-500">+{totalXp} XP</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400" /> Enrolled Learners</span>
                <span className="font-bold">{course.enrollmentsCount}</span>
              </div>
            </div>

            {/* Progress or Enroll Button */}
            {enrollment ? (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Your Progress</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{enrollment.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${enrollment.progressPercentage}%` }}
                  />
                </div>
                <button
                  onClick={() => {
                    const nextLessonId = enrollment.lastLessonId || allLessons[0].id;
                    onStartLesson(course.id, nextLessonId);
                  }}
                  className="w-full py-3.5 rounded-xl font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>Resume Course</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full py-3.5 rounded-xl font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>{enrolling ? 'Enrolling...' : 'Enroll Free & Start Learning'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum Accordion (Syllabus) */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Course Curriculum & Modules
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {course.chapters.length} chapters • {allLessons.length} interactive lessons
          </p>
        </div>

        <div className="space-y-4">
          {course.chapters.map((chapter, chIdx) => {
            const isOpen = openChapterIds[chapter.id];
            return (
              <div
                key={chapter.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                      {chIdx + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {chapter.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {chapter.lessons.length} lessons
                      </p>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 space-y-2 border-t border-slate-100 dark:border-slate-800/80">
                    {chapter.lessons.map(lesson => {
                      const completed = isCompleted(lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => onStartLesson(course.id, lesson.id)}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            {completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              getLessonIcon(lesson.type)
                            )}
                            <div>
                              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {lesson.title}
                              </span>
                              <div className="text-[11px] text-slate-400 capitalize">
                                {lesson.type} • {lesson.durationMinutes} mins
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-amber-500">
                              +{lesson.xpReward} XP
                            </span>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              Play →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Outcomes Checklist */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
          What You Will Master
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {course.learningOutcomes?.map((outcome, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{outcome}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
