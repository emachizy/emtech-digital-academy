/**
 * Development seed data. Never run against production.
 *
 * Populates Supabase with realistic content mirroring the current mock data
 * in src/data/*, so swapping the frontend over to real endpoints produces
 * the same screens the UI was designed against.
 *
 * Only run this once against a fresh database. It only resets the seeded
 * auth users (by email) before recreating them — domain tables (cohorts,
 * tracks, projects, ...) are not cleared, so re-running against a
 * previously-seeded database will fail on unique constraints (cohort code,
 * track/subject/project slugs). To re-seed, re-run the migrations in
 * supabase/migrations/ against a clean database first.
 *
 * Usage: bun run db:seed
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (see .env)");
}

const db = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEV_PASSWORD = "TechEdu!2026";

async function resetExistingUser(email: string) {
  const { data } = await db.auth.admin.listUsers();
  const existing = data.users.find((u) => u.email === email);
  if (existing) await db.auth.admin.deleteUser(existing.id);
}

async function createUser(email: string, fullName: string) {
  await resetExistingUser(email);
  const { data, error } = await db.auth.admin.createUser({
    email,
    password: DEV_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !data.user) throw error ?? new Error(`Failed to create ${email}`);
  return data.user.id;
}

async function main() {
  console.log("Creating auth users + profiles...");
  const adminId = await createUser("admin@techedu.local", "Admin User");
  const mentorId = await createUser("mentor@techedu.local", "Sarah Johnson");
  const alexId = await createUser("student@techedu.local", "Alex Johnson");
  const priyaId = await createUser("priya@techedu.local", "Priya Nair");
  const tomiwaId = await createUser("tomiwa@techedu.local", "Tomiwa Bello");

  // handle_new_user() defaults everyone to role='student'; promote here as
  // the service role (bypasses the self-escalation trigger by design).
  await db.from("profiles").update({ role: "admin" }).eq("id", adminId);
  await db.from("profiles").update({ role: "mentor" }).eq("id", mentorId);
  await db
    .from("profiles")
    .update({
      bio: "Frontend student at TechEdu building interfaces that feel fast and friendly. Currently deep in JavaScript and React.",
      location: "Lagos, Nigeria",
      xp: 2450,
      level: 7,
      streak_days: 12,
    })
    .eq("id", alexId);

  console.log("Creating cohort...");
  const { data: cohort, error: cohortError } = await db
    .from("cohorts")
    .insert({
      name: "Frontend Development",
      code: "Cohort 2026-A",
      period_label: "January — June 2026",
      instructor_profile_id: mentorId,
    })
    .select("id")
    .single();
  if (cohortError) throw cohortError;
  const cohortId = cohort.id as string;

  const studentIds = [alexId, priyaId, tomiwaId];
  await db
    .from("cohort_members")
    .insert(studentIds.map((profile_id) => ({ cohort_id: cohortId, profile_id })));
  await db.from("mentor_assignments").insert({ mentor_profile_id: mentorId, cohort_id: cohortId });

  console.log("Creating track + subjects + topics + lessons...");
  const { data: track, error: trackError } = await db
    .from("tracks")
    .insert({
      name: "Frontend Development",
      slug: "frontend-development",
      description:
        "From semantic markup to production React apps. The core track for Cohort 2026-A.",
    })
    .select("id")
    .single();
  if (trackError) throw trackError;
  const trackId = track.id as string;

  const subjectDefs = [
    {
      slug: "html",
      name: "HTML",
      icon: "FileCode2",
      color: "electric",
      description: "Structure, semantics and accessible markup.",
      hours: 8,
      completed: 9,
    },
    {
      slug: "css",
      name: "CSS",
      icon: "Palette",
      color: "primary",
      description: "Layout, responsive design and modern styling.",
      hours: 14,
      completed: 10,
    },
    {
      slug: "javascript",
      name: "JavaScript",
      icon: "Braces",
      color: "warning",
      description: "The language of the web, from syntax to async.",
      hours: 24,
      completed: 6,
    },
    {
      slug: "git",
      name: "Git & GitHub",
      icon: "GitBranch",
      color: "success",
      description: "Version control and collaborating with a team.",
      hours: 6,
      completed: 3,
    },
    {
      slug: "react",
      name: "React",
      icon: "Atom",
      color: "electric",
      description: "Components, state and building real interfaces.",
      hours: 28,
      completed: 3,
    },
    {
      slug: "apis",
      name: "APIs",
      icon: "Plug",
      color: "primary",
      description: "Fetching, REST conventions and error handling.",
      hours: 10,
      completed: 1,
    },
    {
      slug: "typescript",
      name: "TypeScript",
      icon: "Type",
      color: "electric",
      description: "Types, generics and safer JavaScript.",
      hours: 12,
      completed: 0,
    },
    {
      slug: "testing",
      name: "Testing",
      icon: "FlaskConical",
      color: "success",
      description: "Unit, integration and confidence in your code.",
      hours: 8,
      completed: 0,
    },
    {
      slug: "deployment",
      name: "Deployment",
      icon: "Rocket",
      color: "warning",
      description: "Shipping to production and CI basics.",
      hours: 5,
      completed: 0,
    },
  ] as const;

  const topicTitles: Record<string, string[]> = {
    html: [
      "Introduction",
      "Document Structure",
      "Text & Headings",
      "Links & Images",
      "Lists & Tables",
      "Forms",
      "Semantic HTML",
      "Accessibility",
      "HTML Project",
    ],
    css: [
      "Introduction",
      "Selectors",
      "The Box Model",
      "Colors & Units",
      "Typography",
      "Flexbox",
      "Grid",
      "Positioning",
      "Transitions",
      "Responsive Design",
      "Custom Properties",
      "CSS Project",
    ],
    javascript: [
      "Introduction",
      "Variables",
      "Data Types",
      "Operators",
      "Functions",
      "Arrays",
      "Objects",
      "DOM Manipulation",
      "Events",
      "Async JavaScript",
      "Working with APIs",
    ],
    git: [
      "Why Version Control",
      "First Repository",
      "Commits & History",
      "Branching",
      "Merging & Conflicts",
      "Pull Requests",
      "Team Workflows",
    ],
    react: [
      "Why React",
      "JSX",
      "Components",
      "Props",
      "State",
      "Events",
      "Lists & Keys",
      "Forms",
      "Effects",
      "Custom Hooks",
      "Routing",
      "Data Fetching",
      "React Project",
    ],
    apis: [
      "What is an API",
      "HTTP Basics",
      "Fetch",
      "REST Conventions",
      "Authentication",
      "Error Handling",
      "Pagination",
      "API Project",
    ],
    typescript: [
      "Why TypeScript",
      "Basic Types",
      "Interfaces",
      "Unions & Narrowing",
      "Generics",
      "Utility Types",
      "Typing React",
      "Config & Tooling",
      "TypeScript Project",
    ],
    testing: [
      "Testing Mindset",
      "Unit Tests",
      "Testing the DOM",
      "Mocking",
      "Integration Tests",
      "Testing Project",
    ],
    deployment: [
      "Build Tools",
      "Environment Variables",
      "Deploying a Site",
      "Custom Domains",
      "CI Basics",
    ],
  };
  const difficulties = ["Easy", "Easy", "Medium", "Medium", "Medium", "Hard"] as const;

  // Per-subject lesson row ids, keyed by 1-based topic order, for progress/challenge wiring below.
  const lessonIdsBySubject: Record<string, string[]> = {};

  for (const subject of subjectDefs) {
    const { data: subjectRow, error: subjectError } = await db
      .from("subjects")
      .insert({
        track_id: trackId,
        name: subject.name,
        slug: subject.slug,
        icon: subject.icon,
        color: subject.color,
        description: subject.description,
        estimated_hours: subject.hours,
        order_index: subjectDefs.indexOf(subject),
      })
      .select("id")
      .single();
    if (subjectError) throw subjectError;
    const subjectId = subjectRow.id as string;

    const titles = topicTitles[subject.slug] ?? [];
    const lessonIds: string[] = [];
    for (let index = 0; index < titles.length; index++) {
      const title = titles[index]!;
      const durationMinutes = 18 + ((index * 7) % 30);
      const { data: topicRow, error: topicError } = await db
        .from("topics")
        .insert({
          subject_id: subjectId,
          title,
          summary: `Understand ${title.toLowerCase()} through guided explanation, examples and a short practice exercise.`,
          difficulty: difficulties[index % difficulties.length],
          duration_minutes: durationMinutes,
          order_index: index,
        })
        .select("id")
        .single();
      if (topicError) throw topicError;
      const topicId = topicRow.id as string;

      const { data: lessonRow, error: lessonError } = await db
        .from("lessons")
        .insert({
          topic_id: topicId,
          title,
          slug: `${subject.slug}-${index + 1}`,
          duration_minutes: durationMinutes,
          order_index: index,
          content: {
            videoLabel: `${subject.name} · ${title}`,
            intro: `In this lesson you'll learn ${title.toLowerCase()} in ${subject.name}, why it matters in real projects, and how to apply it immediately.`,
            sections: [
              {
                heading: "Concept",
                body: `${title} is one of the building blocks of ${subject.name}. Instead of memorising syntax, focus on the mental model: what problem does it solve, and when would you reach for it in a real interface?`,
              },
              {
                heading: "Example",
                body: "Read through the example below, then type it out yourself. Typing beats copying — it builds recall.",
                code: `// ${subject.name} — ${title}\nconst heading = document.querySelector("h1");\n\nheading.textContent = "Hello, TechEdu";\nheading.classList.add("is-active");`,
              },
              {
                heading: "Common mistakes",
                body: "Watch out for running your script before the DOM is ready, and for silently overwriting content you meant to append.",
              },
            ],
            resources: [
              { label: `MDN — ${title}`, type: "Documentation" },
              { label: `${subject.name} cheat sheet`, type: "PDF" },
              { label: "Lesson starter files", type: "Download" },
            ],
            exercise: {
              prompt: `Apply ${title.toLowerCase()} by updating the starter snippet so the page greets the current student by name.`,
              starter: `const student = "Alex";\n\n// TODO: render a greeting into #app\n`,
            },
            quiz: [
              {
                question: `Which statement best describes ${title.toLowerCase()}?`,
                options: [
                  "A styling-only concern with no logic involved",
                  "A core building block used across real projects",
                  "A deprecated approach kept for legacy browsers",
                ],
                answerIndex: 1,
              },
            ],
          },
        })
        .select("id")
        .single();
      if (lessonError) throw lessonError;
      lessonIds.push(lessonRow.id as string);
    }
    lessonIdsBySubject[subject.slug] = lessonIds;
  }

  console.log("Seeding lesson progress for students...");
  for (const subject of subjectDefs) {
    const lessonIds = lessonIdsBySubject[subject.slug]!;
    const rows: {
      profile_id: string;
      lesson_id: string;
      status: string;
      started_at: string;
      completed_at: string | null;
    }[] = [];
    lessonIds.forEach((lessonId, index) => {
      if (index < subject.completed) {
        rows.push({
          profile_id: alexId,
          lesson_id: lessonId,
          status: "completed",
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        });
      } else if (index === subject.completed) {
        rows.push({
          profile_id: alexId,
          lesson_id: lessonId,
          status: "in_progress",
          started_at: new Date().toISOString(),
          completed_at: null,
        });
      }
    });
    // Priya and Tomiwa: a lighter, non-empty progress trail (HTML only).
    if (subject.slug === "html") {
      for (const profile_id of [priyaId, tomiwaId]) {
        lessonIds.slice(0, 5).forEach((lessonId) => {
          rows.push({
            profile_id,
            lesson_id: lessonId,
            status: "completed",
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          });
        });
      }
    }
    if (rows.length) {
      const { error } = await db.from("lesson_progress").insert(rows);
      if (error) throw error;
    }
  }

  console.log("Creating class sessions + attendance...");
  const pastSessions = [
    { title: "React Fundamentals", daysAgo: 0, status: "present" },
    { title: "Async JavaScript", daysAgo: 1, status: "present" },
    { title: "Git Workflows", daysAgo: 2, status: "late" },
    { title: "CSS Grid Lab", daysAgo: 3, status: "present" },
    { title: "DOM Manipulation", daysAgo: 6, status: "absent" },
    { title: "Responsive Design", daysAgo: 7, status: "present" },
    { title: "JavaScript Functions", daysAgo: 8, status: "present" },
    { title: "Flexbox Deep Dive", daysAgo: 9, status: "late" },
  ] as const;

  for (const session of pastSessions) {
    const startsAt = new Date(Date.now() - session.daysAgo * 24 * 60 * 60 * 1000);
    const endsAt = new Date(startsAt.getTime() + 90 * 60 * 1000);
    const { data: sessionRow, error: sessionError } = await db
      .from("class_sessions")
      .insert({
        cohort_id: cohortId,
        title: session.title,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        instructor_profile_id: mentorId,
        mode: "Live · Room B",
      })
      .select("id")
      .single();
    if (sessionError) throw sessionError;

    const { error: attendanceError } = await db.from("attendance_records").insert({
      class_session_id: sessionRow.id,
      profile_id: alexId,
      status: session.status,
      method: "manual",
      checked_in_at: startsAt.toISOString(),
      verified_by_profile_id: mentorId,
    });
    if (attendanceError) throw attendanceError;
  }

  // A couple of upcoming sessions for the dashboard's "Upcoming classes" card.
  const upcoming = [
    { title: "React Fundamentals", inDays: 0, hour: 14 },
    { title: "Async JavaScript Deep Dive", inDays: 1, hour: 10 },
    { title: "Git Workflows in Teams", inDays: 3, hour: 13.5 },
  ];
  for (const session of upcoming) {
    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() + session.inDays);
    startsAt.setHours(Math.floor(session.hour), (session.hour % 1) * 60, 0, 0);
    const endsAt = new Date(startsAt.getTime() + 90 * 60 * 1000);
    const { error } = await db.from("class_sessions").insert({
      cohort_id: cohortId,
      title: session.title,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      instructor_profile_id: mentorId,
      mode: "Live · Room B",
    });
    if (error) throw error;
  }

  console.log("Seeding practice challenges...");
  const challengeDefs = [
    {
      key: "ch_reverse",
      title: "Reverse a String",
      category: "Algorithms",
      difficulty: "Easy",
      xp: 50,
      minutes: 10,
      description: "Return a new string with the characters in reverse order.",
      instructions: [
        "Write a function reverse(input) that returns the reversed string.",
        "Do not mutate the original input.",
        "Handle an empty string.",
      ],
      starter: `function reverse(input) {\n  // your code here\n}\n\nconsole.log(reverse("TechEdu"));`,
      expectedOutput: "udEhceT",
      completed: true,
    },
    {
      key: "ch_semantic",
      title: "Semantic Page Skeleton",
      category: "HTML",
      difficulty: "Easy",
      xp: 40,
      minutes: 12,
      description: "Build a page skeleton using the right landmark elements.",
      instructions: [
        "Use header, nav, main and footer.",
        "Include exactly one h1.",
        "Give the nav an accessible label.",
      ],
      starter: `<!-- build the skeleton -->\n<div></div>`,
      expectedOutput: "A valid landmark structure",
      completed: true,
    },
    {
      key: "ch_center",
      title: "Center Anything",
      category: "CSS",
      difficulty: "Easy",
      xp: 40,
      minutes: 8,
      description: "Center a card both horizontally and vertically using flexbox.",
      instructions: ["Use flexbox only.", "The card must stay centered at any viewport size."],
      starter: `.wrapper {\n  /* your code here */\n}`,
      expectedOutput: "Card centered in the viewport",
      completed: false,
    },
    {
      key: "ch_debounce",
      title: "Write a Debounce",
      category: "JavaScript",
      difficulty: "Medium",
      xp: 80,
      minutes: 20,
      description: "Implement a debounce helper that delays a callback until input settles.",
      instructions: [
        "debounce(fn, wait) returns a new function.",
        "Repeated calls reset the timer.",
        "Preserve the latest arguments.",
      ],
      starter: `function debounce(fn, wait) {\n  // your code here\n}`,
      expectedOutput: "Callback fires once after the wait period",
      completed: false,
    },
    {
      key: "ch_counter",
      title: "Controlled Counter",
      category: "React",
      difficulty: "Easy",
      xp: 50,
      minutes: 10,
      description: "Build a counter component with increment, decrement and reset.",
      instructions: [
        "Use useState for the count.",
        "Prevent the count from going below zero.",
        "Reset returns to zero.",
      ],
      starter: `export function Counter() {\n  // your code here\n}`,
      expectedOutput: "A working counter",
      completed: false,
    },
    {
      key: "ch_fetch",
      title: "Fetch with Retry",
      category: "APIs",
      difficulty: "Hard",
      xp: 120,
      minutes: 30,
      description: "Wrap fetch so failed requests retry with exponential backoff.",
      instructions: [
        "Retry up to three times.",
        "Double the delay after each failure.",
        "Throw the final error if all attempts fail.",
      ],
      starter: `async function fetchWithRetry(url, options) {\n  // your code here\n}`,
      expectedOutput: "Resolved response or a thrown error after 3 attempts",
      completed: false,
    },
    {
      key: "ch_grid",
      title: "Responsive Card Grid",
      category: "CSS",
      difficulty: "Medium",
      xp: 70,
      minutes: 18,
      description: "Create a card grid that reflows without media queries.",
      instructions: ["Use CSS grid auto-fit.", "Cards must never shrink below 220px."],
      starter: `.grid {\n  /* your code here */\n}`,
      expectedOutput: "A fluid, wrapping grid",
      completed: false,
    },
    {
      key: "ch_groupby",
      title: "Group By Key",
      category: "Algorithms",
      difficulty: "Medium",
      xp: 80,
      minutes: 20,
      description: "Group an array of objects by a given key.",
      instructions: ["Return an object of arrays.", "Do not mutate the input array."],
      starter: `function groupBy(items, key) {\n  // your code here\n}`,
      expectedOutput: "{ frontend: [...], backend: [...] }",
      completed: false,
    },
  ];

  for (const challenge of challengeDefs) {
    const { data: row, error } = await db
      .from("practice_challenges")
      .insert({
        title: challenge.title,
        category: challenge.category,
        difficulty: challenge.difficulty,
        xp: challenge.xp,
        minutes: challenge.minutes,
        description: challenge.description,
        instructions: challenge.instructions,
        starter: challenge.starter,
        expected_output: challenge.expectedOutput,
      })
      .select("id")
      .single();
    if (error) throw error;
    if (challenge.completed) {
      const { error: attemptError } = await db.from("challenge_attempts").insert({
        profile_id: alexId,
        challenge_id: row.id,
        response: challenge.starter,
        completed: true,
      });
      if (attemptError) throw attemptError;
    }
  }

  console.log("Seeding projects + submission + review...");
  const projectDefs = [
    {
      slug: "portfolio-website",
      subjectSlug: "html",
      title: "Portfolio Website",
      summary: "A personal developer portfolio that shows who you are and what you've built.",
      difficulty: "Easy",
      deadline: "2026-08-18",
      xp: 200,
      overview:
        "Build a single-page portfolio that introduces you, lists your skills and showcases at least three projects. This is the site you'll share with employers, so treat it as a real product.",
      requirements: [
        "Responsive layout from 320px to 1440px",
        "Hero section with your name, role and a call to action",
        "Projects grid with at least three entries",
        "Contact section with a working mailto link",
        "Lighthouse accessibility score of 90+",
      ],
      instructions: [
        "Sketch the layout before writing markup.",
        "Build mobile-first, then add breakpoints.",
        "Use semantic HTML landmarks throughout.",
        "Deploy to a static host and share the live URL.",
      ],
      objectives: [
        "Translate a design idea into semantic markup",
        "Apply responsive layout techniques confidently",
        "Ship and deploy a real site end to end",
      ],
      technologies: ["HTML", "CSS", "Git"],
      resources: [
        { label: "Portfolio content checklist", type: "PDF" },
        { label: "Responsive layout patterns", type: "Article" },
      ],
      submissionRequirements: [
        "GitHub repository URL",
        "Live site URL",
        "Short description of your approach",
        "At least one screenshot",
      ],
      rubric: [
        {
          criterion: "Code Quality",
          weight: 25,
          description: "Readable, organised, no dead code.",
        },
        { criterion: "UI/UX", weight: 25, description: "Clear hierarchy, comfortable spacing." },
        { criterion: "Functionality", weight: 20, description: "Everything works as specified." },
        { criterion: "Responsiveness", weight: 20, description: "Great on mobile and desktop." },
        { criterion: "Documentation", weight: 10, description: "Helpful README and comments." },
      ],
    },
    {
      slug: "ecommerce-product-page",
      subjectSlug: "javascript",
      title: "E-commerce Product Page",
      summary: "A polished product detail page with gallery, variants and an add-to-cart flow.",
      difficulty: "Medium",
      deadline: "2026-08-25",
      xp: 250,
      overview:
        "Recreate a modern product page with an image gallery, variant selection, quantity control and a cart drawer. State management is done in plain JavaScript.",
      requirements: [
        "Image gallery with thumbnail switching",
        "Variant and quantity selectors",
        "Cart drawer that reflects selections",
        "Empty cart state",
      ],
      instructions: [
        "Model your cart state before touching the DOM.",
        "Keep rendering functions pure and small.",
        "Handle keyboard interaction on all controls.",
      ],
      objectives: [
        "Manage UI state without a framework",
        "Build accessible interactive components",
        "Structure JavaScript into modules",
      ],
      technologies: ["HTML", "CSS", "JavaScript"],
      resources: [
        { label: "Product page reference designs", type: "Figma" },
        { label: "Accessible dialogs", type: "Article" },
      ],
      submissionRequirements: ["GitHub repository URL", "Live site URL", "Project description"],
      rubric: [
        { criterion: "Code Quality", weight: 30, description: "Modular, predictable state." },
        { criterion: "UI/UX", weight: 25, description: "Feels like a real store." },
        { criterion: "Functionality", weight: 25, description: "Cart behaves correctly." },
        { criterion: "Responsiveness", weight: 20, description: "Usable on small screens." },
      ],
    },
    {
      slug: "weather-application",
      subjectSlug: "apis",
      title: "Weather Application",
      summary: "Fetch live weather by city with loading, empty and error states.",
      difficulty: "Medium",
      deadline: "2026-09-01",
      xp: 250,
      overview:
        "Consume a public weather API and present current conditions plus a short forecast. The focus is on handling every state gracefully.",
      requirements: [
        "City search with debounce",
        "Current conditions card",
        "Five-day forecast",
        "Loading, empty and error states",
      ],
      instructions: [
        "Start by drawing the three states on paper.",
        "Never leave a request without a failure path.",
        "Cache the last successful result.",
      ],
      objectives: [
        "Work confidently with fetch and async/await",
        "Design for failure, not just the happy path",
      ],
      technologies: ["JavaScript", "Fetch API", "CSS"],
      resources: [{ label: "Open weather API docs", type: "Documentation" }],
      submissionRequirements: ["GitHub repository URL", "Live site URL", "Project description"],
      rubric: [
        { criterion: "Code Quality", weight: 30, description: "Clean async handling." },
        { criterion: "Functionality", weight: 30, description: "All states covered." },
        { criterion: "UI/UX", weight: 25, description: "Readable and calm." },
        { criterion: "Documentation", weight: 15, description: "Setup steps included." },
      ],
    },
    {
      slug: "task-manager",
      subjectSlug: "react",
      title: "Task Manager",
      summary: "A CRUD task board with filters, persistence and keyboard shortcuts.",
      difficulty: "Medium",
      deadline: "2026-09-12",
      xp: 300,
      overview:
        "Build a task manager in React with create, edit, complete and delete flows, plus filtering and local persistence.",
      requirements: [
        "Create, edit, complete and delete tasks",
        "Filter by status",
        "Persist to local storage",
        "Empty state for a fresh board",
      ],
      instructions: [
        "Split the board into small components.",
        "Lift state only as high as it needs to go.",
        "Add a keyboard shortcut for new task.",
      ],
      objectives: ["Compose React components", "Model derived state correctly"],
      technologies: ["React", "TypeScript", "CSS"],
      resources: [{ label: "React thinking in components", type: "Documentation" }],
      submissionRequirements: ["GitHub repository URL", "Live site URL", "Project description"],
      rubric: [
        { criterion: "Code Quality", weight: 30, description: "Component boundaries make sense." },
        { criterion: "Functionality", weight: 30, description: "CRUD works end to end." },
        { criterion: "UI/UX", weight: 25, description: "Fast and obvious to use." },
        { criterion: "Documentation", weight: 15, description: "README explains decisions." },
      ],
    },
    {
      slug: "rest-api",
      subjectSlug: "apis",
      title: "REST API",
      summary: "Design and document a small REST API with proper status codes.",
      difficulty: "Hard",
      deadline: "2026-09-26",
      xp: 350,
      overview:
        "Design endpoints for a small resource, implement them, and document the contract so a frontend developer could build against it without asking questions.",
      requirements: [
        "CRUD endpoints for one resource",
        "Correct status codes and error shapes",
        "Input validation",
        "API documentation",
      ],
      instructions: [
        "Write the contract before the code.",
        "Validate every input at the boundary.",
        "Return consistent error objects.",
      ],
      objectives: ["Design a predictable API surface", "Practise defensive server-side validation"],
      technologies: ["Node", "REST", "Testing"],
      resources: [{ label: "REST API design guide", type: "Article" }],
      submissionRequirements: ["GitHub repository URL", "API documentation link", "Description"],
      rubric: [
        { criterion: "Code Quality", weight: 30, description: "Layered and testable." },
        { criterion: "Functionality", weight: 30, description: "Endpoints behave correctly." },
        { criterion: "Documentation", weight: 25, description: "Contract is unambiguous." },
        { criterion: "Testing", weight: 15, description: "Key paths covered." },
      ],
    },
    {
      slug: "full-stack-application",
      subjectSlug: "react",
      title: "Full Stack Application",
      summary: "Your capstone: a complete product with frontend, API and deployment.",
      difficulty: "Hard",
      deadline: "2026-10-20",
      xp: 500,
      overview:
        "Combine everything from the track into one deployed product with authentication, persistent data and a polished interface.",
      requirements: [
        "Authenticated user flow",
        "Persistent data layer",
        "Responsive interface",
        "Deployed and publicly reachable",
      ],
      instructions: [
        "Scope ruthlessly — one feature done well beats five half-built.",
        "Deploy in week one, not week six.",
        "Keep a changelog as you go.",
      ],
      objectives: ["Ship a complete product", "Integrate frontend and backend confidently"],
      technologies: ["React", "TypeScript", "REST", "Deployment"],
      resources: [{ label: "Capstone planning template", type: "PDF" }],
      submissionRequirements: [
        "GitHub repository URL",
        "Live application URL",
        "Project description",
        "Screenshots",
      ],
      rubric: [
        { criterion: "Code Quality", weight: 25, description: "Maintainable architecture." },
        { criterion: "Functionality", weight: 25, description: "Core flows work." },
        { criterion: "UI/UX", weight: 20, description: "Coherent, polished design." },
        { criterion: "Responsiveness", weight: 15, description: "Works on every screen." },
        { criterion: "Documentation", weight: 15, description: "Anyone can run it." },
      ],
    },
  ];

  const subjectIdBySlug: Record<string, string> = {};
  {
    const { data: allSubjects, error } = await db.from("subjects").select("id, slug");
    if (error) throw error;
    for (const row of allSubjects) subjectIdBySlug[row.slug as string] = row.id as string;
  }

  for (const project of projectDefs) {
    const { data: projectRow, error: projectError } = await db
      .from("projects")
      .insert({
        subject_id: subjectIdBySlug[project.subjectSlug] ?? null,
        title: project.title,
        slug: project.slug,
        summary: project.summary,
        overview: project.overview,
        difficulty: project.difficulty,
        deadline: project.deadline,
        xp: project.xp,
        requirements: project.requirements,
        objectives: project.objectives,
        instructions: project.instructions,
        technologies: project.technologies,
        resources: project.resources,
        submission_requirements: project.submissionRequirements,
        rubric: project.rubric,
      })
      .select("id")
      .single();
    if (projectError) throw projectError;

    if (project.slug === "portfolio-website") {
      const { data: submission, error: submissionError } = await db
        .from("project_submissions")
        .insert({
          project_id: projectRow.id,
          profile_id: alexId,
          repo_url: "https://github.com/alexjohnson/portfolio-website",
          live_url: "https://alexjohnson.dev",
          notes: "Built mobile-first, deployed to a static host.",
          status: "approved",
          submitted_at: "2026-08-04T10:00:00Z",
        })
        .select("id")
        .single();
      if (submissionError) throw submissionError;

      const { error: reviewError } = await db.from("project_reviews").insert({
        submission_id: submission.id,
        reviewer_profile_id: mentorId,
        score: 86,
        status: "approved",
        created_at: "2026-08-06T09:00:00Z",
        categories: [
          { name: "Code Quality", score: 88 },
          { name: "UI/UX", score: 90 },
          { name: "Functionality", score: 84 },
          { name: "Responsiveness", score: 86 },
          { name: "Documentation", score: 78 },
        ],
        comment:
          "Excellent implementation. Consider breaking your dashboard into smaller reusable components.",
      });
      if (reviewError) throw reviewError;
    }

    if (project.slug === "ecommerce-product-page") {
      const { error: submissionError } = await db.from("project_submissions").insert({
        project_id: projectRow.id,
        profile_id: alexId,
        status: "draft",
      });
      if (submissionError) throw submissionError;
    }
  }

  console.log("Seeding achievements + certificates...");
  const achievementDefs = [
    {
      key: "ach_first",
      name: "First Lesson",
      description: "Completed your very first lesson.",
      icon: "Sparkles",
      earnedAt: "2026-01-14",
    },
    {
      key: "ach_html",
      name: "HTML Master",
      description: "Finished every topic in HTML.",
      icon: "FileCode2",
      earnedAt: "2026-02-03",
    },
    {
      key: "ach_css",
      name: "CSS Wizard",
      description: "Scored 90%+ on the CSS assessment.",
      icon: "Palette",
      earnedAt: "2026-03-11",
    },
    {
      key: "ach_js",
      name: "JavaScript Explorer",
      description: "Completed 6 JavaScript topics.",
      icon: "Braces",
      earnedAt: "2026-08-05",
    },
    {
      key: "ach_git",
      name: "Git Champion",
      description: "Opened your first pull request.",
      icon: "GitBranch",
      earnedAt: "2026-06-22",
    },
    {
      key: "ach_builder",
      name: "Project Builder",
      description: "Submitted 5 projects for review.",
      icon: "Hammer",
      earnedAt: "2026-07-19",
    },
    {
      key: "ach_react",
      name: "React Rookie",
      description: "Build your first React component.",
      icon: "Atom",
      earnedAt: null,
    },
    {
      key: "ach_streak",
      name: "30-Day Streak",
      description: "Learn every day for 30 days.",
      icon: "Flame",
      earnedAt: null,
    },
    {
      key: "ach_100",
      name: "100 Lessons",
      description: "Complete 100 lessons across the track.",
      icon: "Trophy",
      earnedAt: null,
    },
  ];
  for (const achievement of achievementDefs) {
    const { data: row, error } = await db
      .from("achievements")
      .insert({
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
      })
      .select("id")
      .single();
    if (error) throw error;
    if (achievement.earnedAt) {
      const { error: earnedError } = await db
        .from("student_achievements")
        .insert({ profile_id: alexId, achievement_id: row.id, earned_at: achievement.earnedAt });
      if (earnedError) throw earnedError;
    }
  }

  const certificateDefs = [
    { title: "HTML Fundamentals", progress: 100, issuedAt: "2026-02-05" },
    { title: "CSS & Responsive Design", progress: 84, issuedAt: null },
    { title: "JavaScript Fundamentals", progress: 65, issuedAt: null },
    { title: "React Essentials", progress: 22, issuedAt: null },
  ];
  await db.from("certificates").insert(
    certificateDefs.map((c) => ({
      profile_id: alexId,
      title: c.title,
      progress: c.progress,
      issued_at: c.issuedAt,
    })),
  );

  console.log("Seeding notifications + announcements + portfolio...");
  await db.from("notifications").insert([
    {
      profile_id: alexId,
      kind: "feedback",
      title: "Mentor feedback ready",
      body: "Sarah reviewed your Portfolio Website submission.",
      read: false,
    },
    {
      profile_id: alexId,
      kind: "class",
      title: "Class starts in 1 hour",
      body: "React Fundamentals with Sarah Johnson at 2:00 PM.",
      read: false,
    },
    {
      profile_id: alexId,
      kind: "achievement",
      title: "Achievement unlocked",
      body: "You earned the JavaScript Explorer badge.",
      read: false,
    },
    {
      profile_id: alexId,
      kind: "deadline",
      title: "Deadline approaching",
      body: "JavaScript Calculator Project is due in 4 days.",
      read: true,
    },
    {
      profile_id: alexId,
      kind: "certificate",
      title: "Certificate available",
      body: "Download your HTML Fundamentals certificate.",
      read: true,
    },
  ]);

  await db.from("announcements").insert([
    {
      title: "New Project Available",
      body: "Portfolio Landing Page is now assigned to Cohort 2026-A.",
      kind: "project",
      audience: "cohort",
      cohort_id: cohortId,
      created_by_profile_id: mentorId,
    },
    {
      title: "Workshop",
      body: "Introduction to GitHub — Friday, 4:00 PM with Maya Patel.",
      kind: "workshop",
      audience: "cohort",
      cohort_id: cohortId,
      created_by_profile_id: mentorId,
    },
    {
      title: "Deadline",
      body: "JavaScript Calculator Project closes in 4 days.",
      kind: "deadline",
      audience: "cohort",
      cohort_id: cohortId,
      created_by_profile_id: mentorId,
    },
  ]);

  await db.from("portfolio_profiles").insert({
    profile_id: alexId,
    headline: "Frontend Developer",
    bio: "Frontend student at TechEdu building interfaces that feel fast and friendly. Currently deep in JavaScript and React.",
    is_public: true,
    public_slug: "alex-johnson",
  });

  console.log("\nSeed complete. Test accounts (password: %s):", DEV_PASSWORD);
  console.log("  admin@techedu.local  (admin)");
  console.log("  mentor@techedu.local (mentor)");
  console.log("  student@techedu.local (student — Alex Johnson, main demo account)");
  console.log("  priya@techedu.local / tomiwa@techedu.local (students, lighter data)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
