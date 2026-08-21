import type { Lesson, Subject, Topic, Track } from "@/types";

const subjects: Subject[] = [
  {
    id: "sub_html",
    name: "HTML",
    slug: "html",
    icon: "FileCode2",
    color: "electric",
    description: "Structure, semantics and accessible markup.",
    progress: 100,
    topicCount: 9,
    completedTopics: 9,
    estimatedHours: 8,
  },
  {
    id: "sub_css",
    name: "CSS",
    slug: "css",
    icon: "Palette",
    color: "primary",
    description: "Layout, responsive design and modern styling.",
    progress: 84,
    topicCount: 12,
    completedTopics: 10,
    estimatedHours: 14,
  },
  {
    id: "sub_js",
    name: "JavaScript",
    slug: "javascript",
    icon: "Braces",
    color: "warning",
    description: "The language of the web, from syntax to async.",
    progress: 58,
    topicCount: 11,
    completedTopics: 6,
    estimatedHours: 24,
  },
  {
    id: "sub_git",
    name: "Git & GitHub",
    slug: "git",
    icon: "GitBranch",
    color: "success",
    description: "Version control and collaborating with a team.",
    progress: 45,
    topicCount: 7,
    completedTopics: 3,
    estimatedHours: 6,
  },
  {
    id: "sub_react",
    name: "React",
    slug: "react",
    icon: "Atom",
    color: "electric",
    description: "Components, state and building real interfaces.",
    progress: 22,
    topicCount: 13,
    completedTopics: 3,
    estimatedHours: 28,
  },
  {
    id: "sub_apis",
    name: "APIs",
    slug: "apis",
    icon: "Plug",
    color: "primary",
    description: "Fetching, REST conventions and error handling.",
    progress: 10,
    topicCount: 8,
    completedTopics: 1,
    estimatedHours: 10,
  },
  {
    id: "sub_ts",
    name: "TypeScript",
    slug: "typescript",
    icon: "Type",
    color: "electric",
    description: "Types, generics and safer JavaScript.",
    progress: 0,
    topicCount: 9,
    completedTopics: 0,
    estimatedHours: 12,
  },
  {
    id: "sub_testing",
    name: "Testing",
    slug: "testing",
    icon: "FlaskConical",
    color: "success",
    description: "Unit, integration and confidence in your code.",
    progress: 0,
    topicCount: 6,
    completedTopics: 0,
    estimatedHours: 8,
  },
  {
    id: "sub_deploy",
    name: "Deployment",
    slug: "deployment",
    icon: "Rocket",
    color: "warning",
    description: "Shipping to production and CI basics.",
    progress: 0,
    topicCount: 5,
    completedTopics: 0,
    estimatedHours: 5,
  },
];

export const tracks: Track[] = [
  {
    id: "trk_frontend",
    name: "Frontend Development",
    description: "From semantic markup to production React apps. The core track for Cohort 2026-A.",
    progress: 72,
    subjects,
  },
];

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

export function getTopics(subjectSlug: string): Topic[] {
  const subject = subjects.find((s) => s.slug === subjectSlug);
  const titles = topicTitles[subjectSlug] ?? [];
  const completed = subject?.completedTopics ?? 0;

  return titles.map((title, index) => {
    let status: Topic["status"] = "not-started";
    let progress = 0;
    if (index < completed) {
      status = "completed";
      progress = 100;
    } else if (index === completed) {
      status = "in-progress";
      progress = 65;
    } else if (index > completed + 2) {
      status = "locked";
    }
    return {
      id: `${subjectSlug}-${index + 1}`,
      subjectId: subject?.id ?? subjectSlug,
      title,
      summary: `Understand ${title.toLowerCase()} through guided explanation, examples and a short practice exercise.`,
      status,
      duration: `${18 + ((index * 7) % 30)} min`,
      difficulty: difficulties[index % difficulties.length]!,
      progress,
    };
  });
}

export function getSubject(slug: string): Subject | undefined {
  return subjects.find((s) => s.slug === slug);
}

export const allSubjects = subjects;

export function getLesson(subjectSlug: string, topicId: string): Lesson | undefined {
  const subject = getSubject(subjectSlug);
  const topic = getTopics(subjectSlug).find((t) => t.id === topicId);
  if (!subject || !topic) return undefined;

  return {
    id: `lesson-${topic.id}`,
    topicId: topic.id,
    subjectId: subject.id,
    subjectName: subject.name,
    title: topic.title,
    durationMinutes: parseInt(topic.duration, 10),
    videoLabel: `${subject.name} · ${topic.title}`,
    intro: `In this lesson you'll learn ${topic.title.toLowerCase()} in ${subject.name}, why it matters in real projects, and how to apply it immediately.`,
    sections: [
      {
        heading: "Concept",
        body: `${topic.title} is one of the building blocks of ${subject.name}. Instead of memorising syntax, focus on the mental model: what problem does it solve, and when would you reach for it in a real interface?`,
      },
      {
        heading: "Example",
        body: "Read through the example below, then type it out yourself. Typing beats copying — it builds recall.",
        code: `// ${subject.name} — ${topic.title}\nconst heading = document.querySelector("h1");\n\nheading.textContent = "Hello, TechEdu";\nheading.classList.add("is-active");`,
      },
      {
        heading: "Common mistakes",
        body: "Watch out for running your script before the DOM is ready, and for silently overwriting content you meant to append.",
      },
    ],
    resources: [
      { label: `MDN — ${topic.title}`, type: "Documentation" },
      { label: `${subject.name} cheat sheet`, type: "PDF" },
      { label: "Lesson starter files", type: "Download" },
    ],
    exercise: {
      prompt: `Apply ${topic.title.toLowerCase()} by updating the starter snippet so the page greets the current student by name.`,
      starter: `const student = "Alex";\n\n// TODO: render a greeting into #app\n`,
    },
    quiz: [
      {
        question: `Which statement best describes ${topic.title.toLowerCase()}?`,
        options: [
          "A styling-only concern with no logic involved",
          "A core building block used across real projects",
          "A deprecated approach kept for legacy browsers",
        ],
        answerIndex: 1,
      },
      {
        question: "What is the best way to lock in this lesson?",
        options: [
          "Re-read the notes twice",
          "Watch the video at 2x speed",
          "Rebuild the example from scratch without looking",
        ],
        answerIndex: 2,
      },
    ],
  };
}
