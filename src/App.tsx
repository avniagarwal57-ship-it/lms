import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LevelUpModal } from './components/common/LevelUpModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExplorePage } from './pages/ExplorePage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { LessonPlayerPage } from './pages/LessonPlayerPage';
import { QuizPage } from './pages/QuizPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { AiTutorPage } from './pages/AiTutorPage';
import { MyLearningPage } from './pages/MyLearningPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { ProfilePage } from './pages/ProfilePage';
import { InstructorDashboardPage } from './pages/InstructorDashboardPage';
import { CourseCreatorPage } from './pages/CourseCreatorPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Selected entities for drill-down views
  const [selectedCourseId, setSelectedCourseId] = useState<string>('course-ai-agentic');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('lesson-ai-1');
  const [selectedQuizId, setSelectedQuizId] = useState<string>('quiz-ai-1');
  const [selectedDeckId, setSelectedDeckId] = useState<string>('deck-ai-1');

  // Navigators
  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveTab('course-details');
  };

  const handleStartLesson = (courseId: string, lessonId: string) => {
    setSelectedCourseId(courseId);
    setSelectedLessonId(lessonId);
    setActiveTab('lesson-player');
  };

  const handleOpenQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setActiveTab('quiz');
  };

  const handleOpenFlashcards = (deckId: string) => {
    setSelectedDeckId(deckId);
    setActiveTab('flashcards');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex w-full">
        {/* Navigation Sidebar */}
        {activeTab !== 'landing' && activeTab !== 'auth' && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-16">
          {activeTab === 'landing' && (
            <LandingPage
              setActiveTab={setActiveTab}
              onExploreCourse={handleSelectCourse}
            />
          )}

          {activeTab === 'auth' && (
            <AuthPage setActiveTab={setActiveTab} />
          )}

          {activeTab === 'dashboard' && (
            <DashboardPage
              setActiveTab={setActiveTab}
              onSelectCourse={handleSelectCourse}
              onStartLesson={handleStartLesson}
            />
          )}

          {activeTab === 'explore' && (
            <ExplorePage onSelectCourse={handleSelectCourse} />
          )}

          {activeTab === 'course-details' && (
            <CourseDetailsPage
              courseId={selectedCourseId}
              onBack={() => setActiveTab('explore')}
              onStartLesson={handleStartLesson}
            />
          )}

          {activeTab === 'lesson-player' && (
            <LessonPlayerPage
              courseId={selectedCourseId}
              lessonId={selectedLessonId}
              onBack={() => setActiveTab('course-details')}
              onNavigateLesson={newId => setSelectedLessonId(newId)}
              onOpenQuiz={handleOpenQuiz}
              onOpenFlashcards={handleOpenFlashcards}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizPage
              quizId={selectedQuizId}
              onBack={() => setActiveTab('lesson-player')}
              onFinish={() => setActiveTab('lesson-player')}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsPage
              deckId={selectedDeckId}
              onBack={() => setActiveTab('lesson-player')}
              onFinish={() => setActiveTab('lesson-player')}
            />
          )}

          {activeTab === 'ai-tutor' && (
            <AiTutorPage />
          )}

          {activeTab === 'my-learning' && (
            <MyLearningPage
              onStartLesson={handleStartLesson}
              onExploreCourses={() => setActiveTab('explore')}
            />
          )}

          {activeTab === 'learning-paths' && (
            <MyLearningPage
              onStartLesson={handleStartLesson}
              onExploreCourses={() => setActiveTab('explore')}
            />
          )}

          {(activeTab === 'achievements' || activeTab === 'leaderboard') && (
            <AchievementsPage />
          )}

          {activeTab === 'profile' && (
            <ProfilePage />
          )}

          {activeTab === 'instructor' && (
            <InstructorDashboardPage
              onCreateCourse={() => setActiveTab('course-creator')}
              onSelectCourse={handleSelectCourse}
            />
          )}

          {activeTab === 'course-creator' && (
            <CourseCreatorPage
              onBack={() => setActiveTab('instructor')}
              onCourseCreated={newId => {
                setSelectedCourseId(newId);
                setActiveTab('course-details');
              }}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboardPage />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Level Up Celebratory Modal */}
      <LevelUpModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
