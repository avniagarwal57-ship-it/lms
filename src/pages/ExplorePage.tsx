import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import {
  Search,
  Filter,
  Star,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  BookOpen,
  Layers,
} from 'lucide-react';

interface ExplorePageProps {
  onSelectCourse: (courseId: string) => void;
}

const CATEGORIES = [
  'All',
  'AI & Machine Learning',
  'UI/UX Design',
  'Full-Stack Web Dev',
  'Cybersecurity',
];

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export const ExplorePage: React.FC<ExplorePageProps> = ({ onSelectCourse }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedLevel, search]);

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedLevel !== 'All') params.append('level', selectedLevel);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/courses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const featuredCourse = courses.find(c => c.featured) || courses[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Explore Courses
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Master high-demand skills through structured, gamified learning paths.
        </p>
      </div>

      {/* Netflix-Style Featured Hero Banner */}
      {featuredCourse && (
        <div
          onClick={() => onSelectCourse(featuredCourse.id)}
          className="relative rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[320px] flex items-end p-6 sm:p-10 cursor-pointer group shadow-2xl"
        >
          {/* Background image with gradient vignette */}
          <img
            src={featuredCourse.thumbnail}
            alt={featuredCourse.title}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-indigo-600 text-white shadow-lg">
                Featured Spotlight
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-amber-300 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                {featuredCourse.rating} ({featuredCourse.reviewsCount} reviews)
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              {featuredCourse.title}
            </h2>

            <p className="text-sm sm:text-base text-slate-200 line-clamp-2">
              {featuredCourse.shortDescription}
            </p>

            <div className="pt-2 flex items-center gap-4">
              <button className="px-6 py-3 rounded-2xl font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 shadow-lg flex items-center gap-2 transition-all">
                <span>Start Learning Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-xs text-slate-300 flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{featuredCourse.durationMinutes} mins total</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by topic, skill, or keyword (e.g. RAG, Agents, Tailwind, OWASP)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="All">All Skill Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                  : 'bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No courses match your filter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            Try adjusting your search query or selecting a different category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedLevel('All');
              setSearch('');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div
              key={course.id}
              onClick={() => onSelectCourse(course.id)}
              className="group cursor-pointer rounded-3xl overflow-hidden bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-950/80 backdrop-blur-md text-white">
                      {course.level}
                    </span>
                  </div>
                  <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-bold rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {course.rating}
                  </span>
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    {course.category}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-500 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                    {course.shortDescription}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {course.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructorName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="truncate max-w-[100px]">{course.instructorName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.durationMinutes}m
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
