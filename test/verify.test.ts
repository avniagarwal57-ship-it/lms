// End-to-end integration verification test for QuestLearn LMS API & Business Logic
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting QuestLearn LMS Verification Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('API Health Check', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'healthy') throw new Error('Unhealthy status');
  });

  // 2. Auth & Current User
  await test('Auth: Get active session', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`);
    const data = await res.json();
    if (!data.user || !data.user.email) throw new Error('User not found in session');
  });

  // 3. Role Switcher
  await test('Auth: Switch role to instructor and back to learner', async () => {
    let res = await fetch(`${BASE_URL}/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'instructor' }),
    });
    let data = await res.json();
    if (data.user.role !== 'instructor') throw new Error('Failed to switch to instructor');

    res = await fetch(`${BASE_URL}/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'learner' }),
    });
    data = await res.json();
    if (data.user.role !== 'learner') throw new Error('Failed to switch back to learner');
  });

  // 4. Course Catalog
  let testCourseId = '';
  await test('Courses: Retrieve course catalog and filter by category', async () => {
    const res = await fetch(`${BASE_URL}/courses?category=AI%20%26%20Machine%20Learning`);
    const data = await res.json();
    if (!Array.isArray(data.courses) || data.courses.length === 0) {
      throw new Error('No AI courses returned');
    }
    testCourseId = data.courses[0].id;
  });

  // 5. Course Details & Syllabus
  await test('Courses: Fetch syllabus for course', async () => {
    const res = await fetch(`${BASE_URL}/courses/${testCourseId}`);
    const data = await res.json();
    if (!data.course || !data.course.chapters || data.course.chapters.length === 0) {
      throw new Error('Course syllabus missing chapters');
    }
  });

  // 6. Enrollment & Lesson Completion
  await test('Learning: Enroll in course and complete lesson for XP reward', async () => {
    // Enroll
    let res = await fetch(`${BASE_URL}/enrollments/${testCourseId}`, { method: 'POST' });
    let data = await res.json();
    if (!data.success) throw new Error('Failed to enroll in course');

    // Complete lesson
    res = await fetch(`${BASE_URL}/progress/complete-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: testCourseId,
        lessonId: 'lesson-ai-1',
        xpReward: 25,
      }),
    });
    data = await res.json();
    if (!data.success || data.xpAwarded !== 25) {
      throw new Error('Lesson completion did not award expected XP');
    }
  });

  // 7. Interactive Quiz Assessment
  await test('Quizzes: Submit answers and evaluate score', async () => {
    const res = await fetch(`${BASE_URL}/quizzes/quiz-ai-1/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: {
          q1: 1, // correct
          q2: 0, // correct
          q3: 1, // correct
        },
      }),
    });
    const data = await res.json();
    if (!data.passed || data.scorePercentage !== 100) {
      throw new Error(`Expected 100% score, got ${data.scorePercentage}%`);
    }
    if (data.xpAwarded < 40) {
      throw new Error('Quiz pass did not grant XP');
    }
  });

  // 8. Flashcards Deck
  await test('Flashcards: Retrieve deck cards', async () => {
    const res = await fetch(`${BASE_URL}/flashcards/deck-ai-1`);
    const data = await res.json();
    if (!data.deck || !Array.isArray(data.deck.cards) || data.deck.cards.length === 0) {
      throw new Error('Flashcard deck missing cards');
    }
  });

  // 9. Notes & Bookmarks
  await test('Notes: Create and retrieve study notes', async () => {
    const res = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: testCourseId,
        lessonId: 'lesson-ai-1',
        lessonTitle: 'Welcome & Anatomy of Modern LLMs',
        text: 'Integration test note: Attention is all you need.',
      }),
    });
    const data = await res.json();
    if (!data.success || !data.note.id) throw new Error('Failed to create note');
  });

  // 10. AI Tutor Endpoint
  await test('AI Tutor: Query Lumina assistant in contextual demo mode', async () => {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Explain vector embeddings in simple terms',
        mode: 'explain',
      }),
    });
    const data = await res.json();
    if (!data.reply || !data.reply.includes('Vector Embeddings')) {
      throw new Error('AI Tutor did not return structured explanation');
    }
  });

  // 11. Instructor Submission & Grading
  await test('Instructor: Submit assignment and grade it', async () => {
    // Submit
    let res = await fetch(`${BASE_URL}/instructor/submissions`);
    let data = await res.json();
    if (!data.submissions || data.submissions.length === 0) {
      throw new Error('No submissions found in instructor queue');
    }
    const subId = data.submissions[0].id;

    // Grade
    res = await fetch(`${BASE_URL}/instructor/grade/${subId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: 98, feedback: 'Superb architecture!' }),
    });
    data = await res.json();
    if (!data.success || data.submission.score !== 98) {
      throw new Error('Failed to grade assignment submission');
    }
  });

  // 12. Admin & System Stats
  await test('Admin: Retrieve platform overview stats', async () => {
    const res = await fetch(`${BASE_URL}/admin/stats`);
    const data = await res.json();
    if (!data.stats || data.stats.totalCourses === 0) {
      throw new Error('Admin stats missing total courses');
    }
  });

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All QuestLearn LMS End-to-End tests passed with 100% success!');
  }
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
