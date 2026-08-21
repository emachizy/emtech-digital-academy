# TechEdu — Tech Academy Learning Platform (MVP)

A premium, responsive student learning platform with realistic mock data, built so a real backend can slot in later without rewriting the UI.

## What gets built now (core experience)

**App shell**
- Collapsible sidebar grouped into MAIN / LEARNING / CAREER / ACCOUNT, collapsing to icons on desktop and a slide-out drawer on mobile.
- Sticky top bar: global search, notifications panel, streak indicator, theme toggle, avatar menu.
- Mobile bottom navigation: Home, Learn, Attendance, Projects, Profile.
- Floating "Ask TechEdu AI" button opening a chat drawer, clearly labelled Preview — canned responses only, no AI backend.

**Pages**
1. Auth UI (sign in / sign up, visual only — picking a role sets the demo session).
2. Student dashboard — greeting, current path, six stat cards, prominent Continue Learning card, weekly activity chart, upcoming classes, announcements, next-action prompts.
3. Learning — track overview with subject cards and progress.
4. Subject page — curriculum topic list with status (completed / in progress / locked / not started), duration, difficulty.
5. Lesson page — distraction-free content column (video placeholder, explanation, code samples, resources, exercise, quiz, mark complete, prev/next) with curriculum sidebar.
6. Attendance — stat cards, monthly colour-coded calendar, simulated check-in (QR / class code / manual), history table.
7. Practice — challenge categories and cards, plus a simulated three-pane playground (instructions / editor / output) architected for Monaco later.
8. Projects — project grid, detail page (requirements, objectives, rubric, resources), submission form, mentor feedback view with score breakdown and resubmit.
9. Portfolio builder — section editors, preview and publish actions (mocked).
10. Achievements — badges, XP breakdown, level progress, optional leaderboard with an opt-out toggle, certificates.
11. Profile — header with ID/cohort/track/level, skills tracking, activity timeline, GitHub connect placeholder with repo stats.
12. Settings — profile, account, password, notifications, appearance, language, privacy, connected accounts.
13. Help page.

**Cross-cutting**
- Skeleton loaders, empty states, and a reusable error state on every major surface.
- Reusable components: StatCard, ProgressRing, CourseCard, SubjectCard, LessonCard, TopicRow, ProjectCard, AchievementBadge, AttendanceCalendar, ActivityTimeline, NotificationItem, SkillProgress, LeaderboardTable, EmptyState, ErrorState, PageHeader.

## Prepared but not implemented
Mentor and Admin dashboards: role types, a permission helper, and route placeholders exist so those areas can be filled in later without restructuring. Cohort data is modelled and shown on the profile.

## Design
Clean premium SaaS: indigo/purple primary, electric blue secondary, emerald success, amber warning, red error — all as semantic tokens in `src/styles.css` with full light and dark themes. Rounded cards, subtle borders, soft shadows, restrained motion. Gradients and glass reserved for the Continue Learning card and level/XP highlights.

## Technical notes
- Routing uses TanStack Router (this stack's router) with file-based routes under `src/routes/`; React Router is not supported here. Everything else matches the spec: React + Vite + TypeScript + Tailwind + shadcn/ui + Framer Motion + TanStack Query + Recharts.
- Mock data lives in `src/data/*` behind typed async accessors in `src/lib/api/*`, consumed via TanStack Query hooks — swapping in real endpoints means editing only the api layer.
- Demo session (student identity, theme, leaderboard opt-in, completed lessons) held in a small client store persisted to localStorage; no backend enabled.
- Each route gets its own SEO metadata.

## Scope note
This is a large build. I'll deliver the MVP list above at production quality first; the future-feature areas ship as architecture plus placeholders rather than half-built screens.
