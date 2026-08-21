-- TechEdu MVP — initial schema
-- Normalized core domain: identity/roles, curriculum, progress, attendance,
-- projects/reviews, achievements, notifications, announcements, portfolio.

create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ==========================================================================
-- Identity & roles
-- ==========================================================================

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'mentor', 'admin')),
  full_name text not null,
  avatar_url text,
  bio text,
  location text,
  github_url text,
  linkedin_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create table cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  period_label text not null,
  instructor_profile_id uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table cohort_members (
  cohort_id uuid not null references cohorts (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (cohort_id, profile_id)
);

create index cohort_members_profile_id_idx on cohort_members (profile_id);

create table mentor_assignments (
  mentor_profile_id uuid not null references profiles (id) on delete cascade,
  cohort_id uuid not null references cohorts (id) on delete cascade,
  primary key (mentor_profile_id, cohort_id)
);

-- ==========================================================================
-- Curriculum
-- ==========================================================================

create table tracks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references tracks (id) on delete cascade,
  name text not null,
  slug text not null unique,
  icon text not null,
  color text not null,
  description text,
  estimated_hours integer not null default 0,
  order_index integer not null default 0
);

create index subjects_track_id_idx on subjects (track_id);

create table topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects (id) on delete cascade,
  title text not null,
  summary text,
  difficulty text not null default 'Easy' check (difficulty in ('Easy', 'Medium', 'Hard')),
  duration_minutes integer not null default 20,
  order_index integer not null default 0
);

create index topics_subject_id_idx on topics (subject_id);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics (id) on delete cascade,
  title text not null,
  slug text not null,
  content jsonb not null default '{}'::jsonb,
  duration_minutes integer not null default 20,
  order_index integer not null default 0,
  published boolean not null default true,
  unique (topic_id, slug)
);

create index lessons_topic_id_idx on lessons (topic_id);

create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  lesson_id uuid not null references lessons (id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  last_accessed_at timestamptz not null default now(),
  unique (profile_id, lesson_id)
);

create index lesson_progress_profile_id_idx on lesson_progress (profile_id);

-- ==========================================================================
-- Attendance
-- ==========================================================================

create table class_sessions (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references cohorts (id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  instructor_profile_id uuid references profiles (id) on delete set null,
  mode text not null default 'Online',
  check_in_code text
);

create index class_sessions_cohort_id_idx on class_sessions (cohort_id);

create table attendance_records (
  id uuid primary key default gen_random_uuid(),
  class_session_id uuid not null references class_sessions (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  status text not null check (status in ('present', 'late', 'absent', 'excused')),
  method text not null check (method in ('qr', 'code', 'manual', 'admin')),
  checked_in_at timestamptz not null default now(),
  verified_by_profile_id uuid references profiles (id) on delete set null,
  unique (class_session_id, profile_id)
);

create index attendance_records_profile_id_idx on attendance_records (profile_id);

-- ==========================================================================
-- Practice
-- ==========================================================================

create table practice_challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  difficulty text not null default 'Easy' check (difficulty in ('Easy', 'Medium', 'Hard')),
  xp integer not null default 0,
  minutes integer not null default 10,
  description text,
  instructions jsonb not null default '[]'::jsonb,
  starter text,
  expected_output text,
  published boolean not null default true
);

create table challenge_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  challenge_id uuid not null references practice_challenges (id) on delete cascade,
  response text,
  completed boolean not null default false,
  submitted_at timestamptz not null default now(),
  unique (profile_id, challenge_id)
);

create index challenge_attempts_profile_id_idx on challenge_attempts (profile_id);

-- ==========================================================================
-- Projects
-- ==========================================================================

create table projects (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects (id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text,
  overview text,
  difficulty text not null default 'Easy' check (difficulty in ('Easy', 'Medium', 'Hard')),
  deadline date,
  xp integer not null default 0,
  requirements jsonb not null default '[]'::jsonb,
  objectives jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '[]'::jsonb,
  technologies jsonb not null default '[]'::jsonb,
  resources jsonb not null default '[]'::jsonb,
  submission_requirements jsonb not null default '[]'::jsonb,
  rubric jsonb not null default '[]'::jsonb,
  published boolean not null default true
);

create table project_submissions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  repo_url text,
  live_url text,
  notes text,
  status text not null default 'draft' check (
    status in ('draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'rejected')
  ),
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

create index project_submissions_profile_id_idx on project_submissions (profile_id);

create trigger project_submissions_set_updated_at
  before update on project_submissions
  for each row execute function set_updated_at();

create table project_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references project_submissions (id) on delete cascade,
  reviewer_profile_id uuid not null references profiles (id) on delete set null,
  score integer check (score between 0 and 100),
  comment text,
  categories jsonb not null default '[]'::jsonb,
  status text not null check (
    status in ('under_review', 'changes_requested', 'approved', 'rejected')
  ),
  created_at timestamptz not null default now()
);

create index project_reviews_submission_id_idx on project_reviews (submission_id);

-- ==========================================================================
-- Achievements & certificates
-- ==========================================================================

create table achievements (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  icon text not null
);

create table student_achievements (
  profile_id uuid not null references profiles (id) on delete cascade,
  achievement_id uuid not null references achievements (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (profile_id, achievement_id)
);

create table certificates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  issuer text not null default 'TechEdu',
  progress integer not null default 0 check (progress between 0 and 100),
  issued_at timestamptz
);

create index certificates_profile_id_idx on certificates (profile_id);

-- ==========================================================================
-- Notifications & announcements
-- ==========================================================================

create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_profile_id_idx on notifications (profile_id, read);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  kind text not null default 'info' check (kind in ('project', 'workshop', 'deadline', 'info')),
  audience text not null check (audience in ('all', 'cohort', 'mentors', 'user')),
  cohort_id uuid references cohorts (id) on delete cascade,
  target_profile_id uuid references profiles (id) on delete cascade,
  created_by_profile_id uuid references profiles (id) on delete set null,
  published_at timestamptz not null default now()
);

create index announcements_cohort_id_idx on announcements (cohort_id);

-- ==========================================================================
-- Portfolio
-- ==========================================================================

create table portfolio_profiles (
  profile_id uuid primary key references profiles (id) on delete cascade,
  headline text,
  bio text,
  is_public boolean not null default false,
  public_slug text unique,
  updated_at timestamptz not null default now()
);

create trigger portfolio_profiles_set_updated_at
  before update on portfolio_profiles
  for each row execute function set_updated_at();
