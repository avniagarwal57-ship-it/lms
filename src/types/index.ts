export type UserRole = 'learner' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  xp: number;
  level: number;
  streakDays: number;
  streakFreezes: number;
  lastActiveDate: string;
  dailyGoalMinutes: number;
  dailyGoalMinutesCompleted: number;
  themePreference?: 'light' | 'dark' | 'system';
  soundEnabled?: boolean;
}

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'code' | 'link' | 'slides';
  url: string;
  size?: string;
}

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  hint?: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  tag?: string;
}

export interface FlashcardDeck {
  id: string;
  lessonId: string;
  title: string;
  cards: Flashcard[];
}

export interface Assignment {
  id: string;
  lessonId: string;
  title: string;
  prompt: string;
  rubric: string[];
  starterCode?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  lessonId: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  content: string;
  submittedAt: string;
  status: 'pending' | 'graded';
  score?: number;
  feedback?: string;
  gradedBy?: string;
}

export type LessonType = 'video' | 'text' | 'quiz' | 'flashcards' | 'assignment';

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  order: number;
  type: LessonType;
  durationMinutes: number;
  xpReward: number;
  videoUrl?: string;
  transcript?: string;
  markdownContent?: string;
  quizId?: string;
  flashcardDeckId?: string;
  assignmentId?: string;
  resources?: Resource[];
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface CourseReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  level: CourseLevel;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  instructorTitle: string;
  durationMinutes: number;
  rating: number;
  reviewsCount: number;
  enrollmentsCount: number;
  thumbnail: string;
  tags: string[];
  learningOutcomes: string[];
  prerequisites: string[];
  published: boolean;
  featured?: boolean;
  chapters: Chapter[];
  reviews?: CourseReview[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progressPercentage: number;
  completedLessonIds: string[];
  lastLessonId?: string;
  lastAccessedAt: string;
  certificateIssued?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: 'streak' | 'xp' | 'quizzes' | 'courses' | 'special';
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  goal: number;
  current: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
  type: 'lessons' | 'quiz' | 'minutes' | 'streak';
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  targetRole: string;
  coursesCount: number;
  durationHours: number;
  badgeIcon: string;
  courseIds: string[];
  skillsGained: string[];
}

export interface Note {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  text: string;
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  activeToday: number;
  totalCourses: number;
  totalEnrollments: number;
  platformCompletionRate: number;
  totalXpAwarded: number;
  weeklyActivity: { day: string; hours: number; xp: number }[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  xp: number;
  streakDays: number;
  tier: 'Diamond' | 'Gold' | 'Silver' | 'Bronze';
  isCurrentUser?: boolean;
}
