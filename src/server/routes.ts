import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { Course, Chapter, Lesson } from '../types/index.js';

export const apiRouter = Router();

// Current active session (default to learner)
let currentUserId = 'user-learner-1';

// Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Auth Routes
apiRouter.get('/auth/me', (_req: Request, res: Response) => {
  const user = db.getUserById(currentUserId) || db.getUsers()[0];
  res.json({ user });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, role } = req.body;
  let user;
  if (email) {
    user = db.getUserByEmail(email);
  } else if (role) {
    user = db.getUsers().find(u => u.role === role);
  }
  if (!user) {
    user = db.getUsers()[0];
  }
  currentUserId = user.id;
  res.json({ success: true, user });
});

apiRouter.post('/auth/switch-role', (req: Request, res: Response) => {
  const { role } = req.body;
  const targetUser = db.getUsers().find(u => u.role === role);
  if (targetUser) {
    currentUserId = targetUser.id;
    return res.json({ success: true, user: targetUser });
  }
  return res.status(404).json({ error: 'Role user not found' });
});

apiRouter.post('/auth/signup', (req: Request, res: Response) => {
  const { name, email, role = 'learner' } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const existing = db.getUserByEmail(email);
  if (existing) {
    currentUserId = existing.id;
    return res.json({ success: true, user: existing });
  }
  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    role: role as any,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80`,
    bio: 'New explorer on QuestLearn',
    xp: 100,
    level: 1,
    streakDays: 1,
    streakFreezes: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    dailyGoalMinutes: 15,
    dailyGoalMinutesCompleted: 0,
    themePreference: 'dark' as const,
    soundEnabled: true,
  };
  db.getData().users.push(newUser);
  db.save();
  currentUserId = newUser.id;
  res.json({ success: true, user: newUser });
});

// Profile update
apiRouter.patch('/profile', (req: Request, res: Response) => {
  const updates = req.body;
  const updated = db.updateUser(currentUserId, updates);
  res.json({ success: true, user: updated });
});

// Course Routes
apiRouter.get('/courses', (req: Request, res: Response) => {
  const { category, level, search, featured } = req.query;
  let courses = db.getCourses();

  if (category && category !== 'All') {
    courses = courses.filter(c => c.category.toLowerCase() === (category as string).toLowerCase());
  }
  if (level && level !== 'All') {
    courses = courses.filter(c => c.level.toLowerCase() === (level as string).toLowerCase());
  }
  if (featured === 'true') {
    courses = courses.filter(c => c.featured);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    courses = courses.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  res.json({ courses });
});

apiRouter.get('/courses/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const course = db.getCourseById(id) || db.getCourseBySlug(id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  const enrollment = db.getEnrollment(currentUserId, course.id);
  res.json({ course, enrollment });
});

apiRouter.post('/courses', (req: Request, res: Response) => {
  const user = db.getUserById(currentUserId);
  if (user?.role !== 'instructor' && user?.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Instructor or Admin role required.' });
  }

  const { title, description, shortDescription, category, level, durationMinutes, thumbnail, tags, learningOutcomes, chapters } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const courseId = `course-${Date.now()}`;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const newCourse: Course = {
    id: courseId,
    title,
    slug,
    description,
    shortDescription: shortDescription || description.slice(0, 140) + '...',
    category: category || 'Web Development',
    level: level || 'Beginner',
    instructorId: user.id,
    instructorName: user.name,
    instructorAvatar: user.avatar,
    instructorTitle: user.bio || 'Instructor at QuestLearn',
    durationMinutes: Number(durationMinutes) || 120,
    rating: 5.0,
    reviewsCount: 1,
    enrollmentsCount: 0,
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    tags: tags || ['Education', 'Tech'],
    learningOutcomes: learningOutcomes || ['Master foundational concepts', 'Build hands-on projects'],
    prerequisites: ['No prerequisites required'],
    published: true,
    chapters: chapters || [
      {
        id: `ch-${Date.now()}-1`,
        courseId,
        title: 'Chapter 1: Getting Started',
        order: 1,
        lessons: [
          {
            id: `lesson-${Date.now()}-1`,
            chapterId: `ch-${Date.now()}-1`,
            title: 'Introduction & Course Overview',
            order: 1,
            type: 'video',
            durationMinutes: 10,
            xpReward: 25,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            markdownContent: '# Welcome to this course!\nGet ready for an exciting learning journey.',
          }
        ]
      }
    ]
  };

  db.createCourse(newCourse);
  res.status(201).json({ success: true, course: newCourse });
});

// Quiz routes
apiRouter.get('/quizzes/:id', (req: Request, res: Response) => {
  const quiz = db.getQuizById(String(req.params.id));
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  // Remove correct answers from question response for honest test
  const sanitizedQuiz = {
    ...quiz,
    questions: quiz.questions.map(q => ({
      id: q.id,
      quizId: q.quizId,
      questionText: q.questionText,
      options: q.options,
      hint: q.hint,
    }))
  };
  res.json({ quiz: sanitizedQuiz, totalQuestions: quiz.questions.length });
});

apiRouter.post('/quizzes/:id/submit', (req: Request, res: Response) => {
  const quiz = db.getQuizById(String(req.params.id));
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const { answers } = req.body; // map of questionId -> selectedOptionIndex
  let correctCount = 0;
  const feedback = quiz.questions.map(q => {
    const selected = answers ? answers[q.id] : undefined;
    const isCorrect = selected === q.correctOptionIndex;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      selected,
      correctOptionIndex: q.correctOptionIndex,
      isCorrect,
      explanation: q.explanation
    };
  });

  const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = scorePercentage >= quiz.passingScore;

  let xpAwarded = 0;
  let leveledUp = false;
  let newLevel = 1;

  if (passed) {
    // Award 40 XP for passing quiz + 20 bonus for 100%
    xpAwarded = scorePercentage === 100 ? 60 : 40;
    const result = db.addXp(currentUserId, xpAwarded);
    leveledUp = result.leveledUp;
    newLevel = result.newLevel;

    // Check achievement if 100%
    if (scorePercentage === 100) {
      db.unlockAchievement('ach-quiz-master');
    }

    // Update Daily Challenge progress for quiz
    const quizChallenge = db.getDailyChallenges().find(c => c.type === 'quiz');
    if (quizChallenge && !quizChallenge.completed) {
      quizChallenge.current = 1;
      quizChallenge.completed = true;
      db.save();
    }
  }

  res.json({
    passed,
    scorePercentage,
    correctCount,
    totalQuestions: quiz.questions.length,
    feedback,
    xpAwarded,
    leveledUp,
    newLevel,
    user: db.getUserById(currentUserId)
  });
});

// Flashcards route
apiRouter.get('/flashcards/:id', (req: Request, res: Response) => {
  const deck = db.getFlashcardDeckById(String(req.params.id));
  if (!deck) {
    return res.status(404).json({ error: 'Flashcard deck not found' });
  }
  res.json({ deck });
});

// Enrollments & Progress
apiRouter.get('/enrollments/my', (_req: Request, res: Response) => {
  const enrollments = db.getEnrollmentsByUser(currentUserId);
  const courses = db.getCourses();
  
  const populated = enrollments.map(e => {
    const course = courses.find(c => c.id === e.courseId);
    return {
      ...e,
      course
    };
  });

  res.json({ enrollments: populated });
});

apiRouter.post('/enrollments/:courseId', (req: Request, res: Response) => {
  const courseId = String(req.params.courseId);
  const enrollment = db.enrollUser(currentUserId, courseId);
  const course = db.getCourseById(courseId);
  res.json({ success: true, enrollment, course });
});

apiRouter.post('/progress/complete-lesson', (req: Request, res: Response) => {
  const { courseId, lessonId, xpReward = 20 } = req.body;
  if (!courseId || !lessonId) {
    return res.status(400).json({ error: 'courseId and lessonId required' });
  }

  const enrollment = db.markLessonComplete(currentUserId, courseId, lessonId);
  const { leveledUp, newLevel } = db.addXp(currentUserId, xpReward);

  // Check achievements
  db.unlockAchievement('ach-first-step');
  const user = db.getUserById(currentUserId);
  if (user && user.xp >= 1000) {
    db.unlockAchievement('ach-xp-1000');
  }

  res.json({
    success: true,
    enrollment,
    xpAwarded: xpReward,
    leveledUp,
    newLevel,
    user: db.getUserById(currentUserId)
  });
});

// Gamification Dashboard
apiRouter.get('/gamification/dashboard', (_req: Request, res: Response) => {
  const user = db.getUserById(currentUserId) || db.getUsers()[0];
  const enrollments = db.getEnrollmentsByUser(currentUserId);
  const courses = db.getCourses();
  const achievements = db.getAchievements();
  const challenges = db.getDailyChallenges();
  const stats = db.getSystemStats();

  // Find resume lesson
  let continueCourse = null;
  let continueLesson = null;

  if (enrollments.length > 0) {
    // Pick first unfinished or most recently accessed
    const activeEnrollment = enrollments.find(e => e.progressPercentage < 100) || enrollments[0];
    const course = courses.find(c => c.id === activeEnrollment.courseId);
    if (course) {
      continueCourse = course;
      // find next lesson
      const allLessons = course.chapters.flatMap(ch => ch.lessons);
      const nextLesson = allLessons.find(l => !activeEnrollment.completedLessonIds.includes(l.id)) || allLessons[0];
      continueLesson = nextLesson;
    }
  }

  res.json({
    user,
    achievements,
    challenges,
    stats,
    continueCourse,
    continueLesson,
    totalCompletedLessons: enrollments.reduce((acc, e) => acc + e.completedLessonIds.length, 0),
    activeCoursesCount: enrollments.length
  });
});

apiRouter.post('/gamification/claim-challenge/:id', (req: Request, res: Response) => {
  const result = db.claimChallenge(String(req.params.id), currentUserId);
  if (!result) {
    return res.status(400).json({ error: 'Challenge cannot be claimed or is already claimed' });
  }
  res.json(result);
});

apiRouter.get('/leaderboard', (_req: Request, res: Response) => {
  const leaderboard = db.getLeaderboard();
  res.json({ leaderboard });
});

apiRouter.get('/learning-paths', (_req: Request, res: Response) => {
  const paths = db.getLearningPaths();
  const courses = db.getCourses();
  const enriched = paths.map(p => ({
    ...p,
    courses: p.courseIds.map(cid => courses.find(c => c.id === cid)).filter(Boolean)
  }));
  res.json({ learningPaths: enriched });
});

// Notes & Bookmarks
apiRouter.get('/notes', (req: Request, res: Response) => {
  const courseId = req.query.courseId as string | undefined;
  const notes = db.getNotes(currentUserId, courseId);
  res.json({ notes });
});

apiRouter.post('/notes', (req: Request, res: Response) => {
  const { courseId, lessonId, lessonTitle, text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Note text required' });
  }
  const note = db.addNote(currentUserId, courseId, lessonId, lessonTitle || 'Lesson', text);
  res.status(201).json({ success: true, note });
});

apiRouter.delete('/notes/:id', (req: Request, res: Response) => {
  const success = db.deleteNote(String(req.params.id), currentUserId);
  res.json({ success });
});

// Instructor Submissions
apiRouter.get('/instructor/submissions', (_req: Request, res: Response) => {
  const submissions = db.getSubmissions();
  res.json({ submissions });
});

apiRouter.post('/instructor/grade/:id', (req: Request, res: Response) => {
  const { score, feedback } = req.body;
  const user = db.getUserById(currentUserId);
  const graded = db.gradeSubmission(String(req.params.id), Number(score), feedback || 'Well done!', user?.name || 'Instructor');
  if (!graded) {
    return res.status(404).json({ error: 'Submission not found' });
  }
  res.json({ success: true, submission: graded });
});

// Admin routes
apiRouter.get('/admin/stats', (_req: Request, res: Response) => {
  const stats = db.getSystemStats();
  res.json({ stats });
});

apiRouter.get('/admin/users', (_req: Request, res: Response) => {
  const users = db.getUsers();
  res.json({ users });
});

apiRouter.patch('/admin/users/:id/role', (req: Request, res: Response) => {
  const { role } = req.body;
  const updated = db.updateUser(String(req.params.id), { role });
  res.json({ success: true, user: updated });
});

// AI Learning Assistant (Lumina AI Tutor)
apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  const { prompt, lessonTitle, courseTitle, mode = 'explain' } = req.body;

  if (!prompt && !mode) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = db.getData().settings.geminiApiKey || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      // Connect to Google Gemini API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const systemInstruction = `You are Lumina, a warm, encouraging, pedagogical AI tutor for QuestLearn LMS.
Current Course: "${courseTitle || 'Computer Science & AI'}"
Current Lesson: "${lessonTitle || 'General Concept'}"
Tutoring Mode: "${mode}"

Guidelines:
- If mode is 'explain', provide intuitive explanations using relatable everyday analogies (ELI5).
- If mode is 'example', give concrete code snippets or real-world industrial cases.
- If mode is 'quiz', ask 2-3 targeted conceptual questions to test understanding.
- If mode is 'hint', give an incremental conceptual hint without giving away the answer.
- If mode is 'summary', provide 3 key bullet points with bold takeaways.
- If mode is 'plan', design a structured 4-week learning roadmap.
- Format with markdown, bullet points, and code blocks where helpful.`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemInstruction}\n\nStudent Question: ${prompt}` }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return res.json({ reply, mode, source: 'gemini-live' });
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to smart contextual engine:', err);
    }
  }

  // Intelligent Context-Aware Demo Mode (clearly labeled & highly contextual)
  let contextualReply = '';

  const cleanPrompt = (prompt || '').toLowerCase();

  if (mode === 'explain' || cleanPrompt.includes('explain') || cleanPrompt.includes('simple')) {
    contextualReply = `💡 **In Simple Terms (ELI5):**

Imagine you are in a gigantic library with a million books, but none of them have titles on the spine. 

- **Vector Embeddings** are like assigning every book a location based on *flavor & genre*. Books about cozy detective mysteries sit on the same shelf, even if one is named "The Blue Letter" and another "Midnight Detective".
- **Retrieval (RAG)** is your personal librarian who runs to that exact shelf, grabs the 3 most relevant pages, and puts them right in front of you so you can write your homework without guessing!

> **Quick Rule of Thumb:** Vectors capture **meaning**, while traditional search only looks for **exact spelling**.`;
  } else if (mode === 'example' || cleanPrompt.includes('example')) {
    contextualReply = `🛠️ **Real-World Production Example:**

Here is how Spotify uses this exact concept for musical discovery:

\`\`\`typescript
// Calculate Cosine Similarity between user taste & track vector
function computeMusicMatch(userProfile: Vector, songFeatures: Vector): number {
  const dotProduct = userProfile.reduce((sum, val, i) => sum + val * songFeatures[i], 0);
  const normUser = Math.sqrt(userProfile.reduce((sum, val) => sum + val * val, 0));
  const normSong = Math.sqrt(songFeatures.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normUser * normSong);
}
\`\`\`

When a song scores \`> 0.85\`, it immediately enters your "Discover Weekly" algorithm queue!`;
  } else if (mode === 'hint' || cleanPrompt.includes('hint')) {
    contextualReply = `🧭 **Lumina's Nudge (No Spoilers!):**

Look closely at the angle between the two arrows rather than their length. 

- Ask yourself: If one vector is twice as long as another, but they point in the exact same direction, is their semantic topic identical?
- *Recall:* Which mathematical formula ignores the length (magnitude) and solely inspects the angle $\\theta$?`;
  } else if (mode === 'summary' || cleanPrompt.includes('summarize')) {
    contextualReply = `📝 **Key Takeaways for ${lessonTitle || 'This Topic'}:**

1. **High-Dimensional Geometry**: Concepts are mapped into 768 or 1536-dimensional space where semantic distance corresponds to Euclidean/Cosine distance.
2. **Hybrid Advantage**: BM25 keyword matching + Dense vector search guarantees both exact term accuracy and conceptual nuance.
3. **Chunking Strategy**: Always overlap sliding window chunks by 15-20% to prevent losing context across boundary cuts.`;
  } else if (mode === 'quiz' || cleanPrompt.includes('practice') || cleanPrompt.includes('test me')) {
    contextualReply = `🎯 **Quick Practice Check:**

**Question:** If you are building a legal document search engine where lawyers search for specific penal codes like \`Section 409-B\`, why would pure vector search fail compared to hybrid search?

*Think about:* Does an embedding model understand the difference between \`409-A\` and \`409-B\`, or do they produce nearly identical dense vectors?`;
  } else if (mode === 'plan' || cleanPrompt.includes('plan') || cleanPrompt.includes('schedule')) {
    contextualReply = `🗺️ **Personalized 4-Week Study Plan:**

- **Week 1 (Foundations)**: Master Transformer mechanics, attention layers, and tokenization dynamics. (*Daily Target: 25 mins*)
- **Week 2 (Embeddings & RAG)**: Build a local hybrid search engine combining BM25 and ChromaDB/Milvus. (*Daily Target: 30 mins*)
- **Week 3 (Agentic Workflows)**: Implement the ReAct cycle with custom tool calling and schema validation. (*Daily Target: 35 mins*)
- **Week 4 (Cap-stone & Deployment)**: Deploy a production agent with streaming UI, rate limits, and automated guardrails. (*Daily Target: 40 mins*)`;
  } else {
    contextualReply = `Great question! In **${courseTitle || 'this course'}**, mastering **${lessonTitle || 'this concept'}** gives you an immense advantage. 

The secret is connecting theoretical math to practical code: always verify your vector dimensions, measure cosine distances, and observe how semantic clustering handles edge cases. 

Would you like me to give you an **intuitive analogy**, show a **code example**, or give you a **quick practice quiz**?`;
  }

  res.json({
    reply: contextualReply,
    mode,
    source: 'contextual-demo-mode',
    note: 'Demo mode active. Add a GEMINI_API_KEY in Settings to enable real-time Gemini generation.'
  });
});

// Settings
apiRouter.get('/settings', (_req: Request, res: Response) => {
  const { settings } = db.getData();
  res.json({
    hasGeminiKey: Boolean(settings.geminiApiKey || process.env.GEMINI_API_KEY),
    maintenanceMode: settings.maintenanceMode,
    allowRegistration: settings.allowRegistration
  });
});

apiRouter.post('/settings', (req: Request, res: Response) => {
  const { geminiApiKey } = req.body;
  if (geminiApiKey !== undefined) {
    db.getData().settings.geminiApiKey = geminiApiKey;
    db.save();
  }
  res.json({ success: true });
});
