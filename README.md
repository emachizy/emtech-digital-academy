# TechPath Pro

TechEdu — Modern Tech Academy Learning Platform

> **Status:** This started as a UI-only prototype on mock data. It now runs
> on a real Supabase (Postgres + Auth) backend with role-based authorization
> for students, mentors, and admins. See `docs/ARCHITECTURE.md`,
> `docs/DATABASE.md`, `docs/API.md`, `docs/DEPLOYMENT.md`, and
> `docs/SECURITY.md` for the current, real state of the system. Everything
> below this point is the original product brief this build was designed
> against.

Build a complete, modern, responsive educational SaaS web application called TechEdu.

TechEdu is not intended to be a generic LMS.

It should function as a Tech Academy Operating System where students can learn technical skills, track attendance, follow structured learning paths, practice coding, complete projects, receive mentor feedback, and gradually build a professional technology portfolio.

The initial product should remain simple and easy to use while its architecture and UI should be capable of supporting more advanced features later.

1. DESIGN DIRECTION

Create a premium SaaS-style interface inspired by the usability and polish of modern productivity and developer applications.

Design characteristics:

Clean and minimal

Premium SaaS appearance

Modern typography

Excellent whitespace

Rounded cards

Subtle borders

Soft shadows

Smooth transitions

Micro-interactions

Beautiful hover states

Skeleton loading states

Empty states

Responsive layouts

Mobile-first design

Excellent accessibility

Dark and light themes

Primary accent:

Purple/Indigo

Secondary accent:

Electric Blue

Success:

Emerald Green

Warning:

Amber

Error:

Red

Avoid excessive gradients and excessive glassmorphism.

Use these effects only for important highlights.

The application should feel professional enough to be used by a real technology academy.

2. TECHNOLOGY

Build using:

React

Vite

TypeScript

Tailwind CSS

shadcn/ui

React Router

Framer Motion

TanStack Query

Recharts

Create reusable components and maintain a clean folder architecture.

For now, use realistic mock data.

Do NOT require backend integration for the initial prototype.

However, structure the frontend so APIs can easily replace mock data later.

3. APPLICATION STRUCTURE

Create three potential roles:

Student

Mentor/Instructor

Administrator

The initial UI should primarily implement the STUDENT experience.

However, structure permissions and components so Mentor and Administrator dashboards can be implemented later.

4. SIDEBAR

Create a collapsible sidebar containing:

Dashboard

Learning

Attendance

Projects

Practice

Portfolio

Achievements

Profile

Settings

Help

Separate navigation sections visually.

Example:

MAIN

Dashboard
Learning
Attendance

LEARNING

Practice
Projects

CAREER

Portfolio
Achievements

ACCOUNT

Profile
Settings

The sidebar should collapse into icons.

On mobile devices it should become a slide-out navigation drawer.

5. TOP NAVIGATION

Create a sticky top navigation.

Include:

Global search

Notification icon

Learning streak indicator

Dark/light mode

Student avatar

Profile dropdown

Global search should eventually allow students to search:

Subjects

Courses

Lessons

Topics

Projects

Resources

6. STUDENT DASHBOARD

Create a beautiful personalized dashboard.

Header:

"Good morning, Alex 👋"

Subtitle:

"Ready to continue learning?"

Display the student's current learning path.

Example:

Frontend Web Development

Dashboard Stats

Create cards displaying:

Attendance

92%

Learning Progress

68%

Topics Completed

47

Current Streak

🔥 12 Days

Projects Completed

6

Skills Earned

14

7. CONTINUE LEARNING

Make this one of the most visually important cards.

Example:

Continue Learning

JavaScript

DOM Manipulation

Progress:

65%

Button:

Continue Lesson →

Display:

Estimated time remaining:

18 minutes

8. WEEKLY ACTIVITY

Create a beautiful chart showing learning activity.

Days:

Mon
Tue
Wed
Thu
Fri
Sat
Sun

Show:

Hours spent learning.

9. UPCOMING CLASSES

Display upcoming classes.

Example:

React Fundamentals

Today

2:00 PM

Instructor:

Sarah Johnson

Button:

View Class

10. ANNOUNCEMENTS

Create announcements.

Example:

New Project Available

"Portfolio Landing Page"

Workshop

"Introduction to GitHub"

Deadline

"JavaScript Calculator Project"

11. LEARNING SECTION

This is one of the most important parts of the application.

Students should see their learning tracks.

Example:

Frontend Development

Progress

72%

Subjects:

HTML

CSS

JavaScript

Git

React

APIs

TypeScript

12. SUBJECT PAGE

Clicking a subject opens its curriculum.

Example:

JavaScript

Progress:

58%

Topics:

Introduction

Variables

Data Types

Operators

Functions

Arrays

Objects

DOM

Events

Async JavaScript

APIs

Each topic displays:

Status

Completed

In Progress

Locked

Not Started

Also display:

Duration

Difficulty

Progress

13. LESSON PAGE

Create a distraction-free learning experience.

Layout:

Main lesson content

Lesson navigation sidebar.

Lesson contains:

Lesson Title

Video

Written explanation

Code examples

Resources

Practice Exercise

Quiz

Mark Complete

Include buttons:

Previous Lesson

Next Lesson

14. LESSON NAVIGATION

Display curriculum beside lesson.

Example:

JavaScript Basics

✓ Introduction

✓ Variables

✓ Data Types

● Functions

○ Arrays

🔒 Objects

🔒 DOM

Students should always understand:

Where am I?

What have I completed?

What should I learn next?

15. ATTENDANCE

Create an attendance dashboard.

Top cards:

Overall Attendance

92%

Classes Attended

44

Classes Missed

3

Late

2

Create monthly calendar.

Indicators:

Green = Present

Red = Absent

Yellow = Late

Gray = No Class

16. ATTENDANCE CHECK-IN

Create:

Check In

button.

Possible methods:

QR Code

Class Code

Instructor Approval

Manual Check-In

For the prototype these can be simulated.

17. ATTENDANCE HISTORY

Create table:

Date

Class

Instructor

Time

Status

18. PRACTICE LAB

Create a Practice section.

Students should practice what they're learning.

Categories:

HTML

CSS

JavaScript

React

Algorithms

APIs

Example challenge:

Reverse a String

Difficulty:

Easy

XP:

+50

Estimated:

10 minutes

Button:

Start Challenge

19. CODING PLAYGROUND

Design a future-ready coding playground interface.

Layout:

Left:

Instructions

Center:

Code Editor

Right/Bottom:

Output

Controls:

Run

Reset

Submit

For the prototype, simulate the editor UI.

Design the architecture so Monaco Editor can later be integrated.

20. PROJECTS

Create a Project Center.

Students should apply their skills through real projects.

Project cards:

Portfolio Website

E-commerce Product Page

Weather Application

Task Manager

REST API

Full Stack Application

Each displays:

Difficulty

Skills

Deadline

Progress

XP

21. PROJECT DETAILS

Clicking a project opens:

Project Overview

Requirements

Instructions

Learning Objectives

Required Technologies

Resources

Submission Requirements

Deadline

Rubric

22. PROJECT SUBMISSION

Allow students to submit:

GitHub Repository

Live Website URL

Project Description

Screenshots

Additional Notes

Button:

Submit Project

23. MENTOR FEEDBACK

Design project feedback.

Example:

Mentor Review

Score:

86/100

Categories:

Code Quality

UI/UX

Functionality

Responsiveness

Documentation

Mentor Feedback:

"Excellent implementation. Consider breaking your dashboard into smaller reusable components."

Allow:

Resubmit Project

24. GITHUB INTEGRATION

Prepare UI for future GitHub integration.

Profile should eventually allow:

Connect GitHub

After connecting:

Display repositories.

Example:

github.com/alex

Repositories

24

Contributions

487

Projects

12

Allow students to attach repositories to project submissions.

25. STUDENT PORTFOLIO

Create a Portfolio Builder.

This should eventually allow students to generate a public developer portfolio.

Sections:

About

Skills

Projects

Certificates

Achievements

GitHub

Education

Experience

Contact

Allow:

Preview Portfolio

Edit Portfolio

Publish Portfolio

26. SKILLS TRACKING

Track skills automatically.

Example:

HTML

Advanced

90%

CSS

Intermediate

76%

JavaScript

Intermediate

64%

React

Beginner

38%

Skills should improve as students:

Complete lessons

Pass quizzes

Complete challenges

Submit projects

27. ACHIEVEMENTS

Create gamification.

Badges:

First Lesson

HTML Master

CSS Wizard

JavaScript Explorer

React Rookie

Git Champion

Project Builder

30-Day Streak

100 Lessons

28. XP SYSTEM

Students earn XP.

Example:

Complete Lesson

+20 XP

Quiz

+30 XP

Challenge

+50 XP

Project

+200 XP

Perfect Attendance

+100 XP

29. LEVEL SYSTEM

Example:

Level 7

Frontend Explorer

XP:

2450 / 3000

Progress bar toward next level.

30. LEADERBOARD

Design an OPTIONAL leaderboard.

Weekly

Monthly

All Time

Display:

Rank

Student

XP

Projects

Streak

Do not make leaderboard performance central to the learning experience.

Students should be able to hide their leaderboard participation.

31. CERTIFICATES

Create certificates section.

Example:

HTML Fundamentals

Completed

Download Certificate

JavaScript Fundamentals

65%

Continue Learning

32. STUDENT PROFILE

Profile header:

Photo

Name

Student ID

Cohort

Learning Track

Level

XP

Display:

Attendance

Courses

Projects

Achievements

Certificates

Skills

GitHub

Activity

33. ACTIVITY TIMELINE

Example:

Completed

CSS Flexbox

2 hours ago

Submitted

Portfolio Website

Yesterday

Earned Badge

7 Day Streak

3 days ago

34. SETTINGS

Sections:

Profile

Account

Password

Notifications

Appearance

Language

Privacy

Connected Accounts

Connected Accounts:

GitHub

Google

Discord

35. NOTIFICATIONS

Create notification center.

Notifications could include:

New lesson

Upcoming class

Project deadline

Project feedback

Achievement unlocked

Certificate available

Mentor message

Announcement

36. AI TUTOR — FUTURE FEATURE

Design a floating:

Ask TechEdu AI

button.

Do NOT implement an actual AI API yet.

Clicking opens a chat drawer.

Placeholder capabilities:

Explain this lesson

Explain this code

Debug my code

Give me an example

Quiz me

Give me a hint

Summarize this topic

The UI should clearly label this as a future/preview feature until a real AI backend is connected.

37. MENTOR SYSTEM — FUTURE FEATURE

Prepare architecture for mentors.

Mentors eventually need:

Mentor Dashboard

Students

Projects

Submissions

Reviews

Attendance

Classes

Messages

Analytics

38. ADMIN — FUTURE FEATURE

Prepare architecture for administrators.

Admin dashboard eventually manages:

Students

Mentors

Courses

Subjects

Topics

Lessons

Classes

Attendance

Projects

Challenges

Certificates

Announcements

Cohorts

Analytics

Settings

39. COHORT SYSTEM

Students belong to cohorts.

Example:

Frontend Development

Cohort 2026-A

January — June

Instructor:

Sarah Johnson

Students:

34

40. RESPONSIVENESS

The entire application must work beautifully on:

Desktop

Laptop

Tablet

Mobile

Do not simply shrink desktop components.

Create responsive versions.

41. MOBILE DASHBOARD

Mobile navigation should have quick access to:

Home

Learn

Attendance

Projects

Profile

Use a modern bottom navigation pattern where appropriate.

42. EMPTY STATES

Every major feature needs attractive empty states.

Example:

No Projects Yet

"Your assigned projects will appear here."

43. LOADING STATES

Implement skeleton loaders for:

Dashboard

Lessons

Subjects

Projects

Attendance

Profile

44. ERROR STATES

Create reusable error components.

Example:

Something went wrong.

Try Again

45. COMPONENT ARCHITECTURE

Avoid creating massive page components.

Break UI into reusable components.

Examples:

Sidebar

Navbar

StatCard

ProgressRing

CourseCard

SubjectCard

LessonCard

ProjectCard

AchievementBadge

AttendanceCalendar

ActivityTimeline

NotificationItem

SkillProgress

LeaderboardTable

46. MOCK DATA

Populate the prototype with realistic student data.

Student:

Alex Johnson

Student ID:

TECH-2026-0042

Cohort:

Frontend Development 2026

Learning Track:

Frontend Developer

Attendance:

92%

Overall Progress:

68%

Level:

7

XP:

2450

Streak:

12 Days

47. SAMPLE CURRICULUM

Frontend Development

HTML

CSS

JavaScript

Git & GitHub

React

APIs

TypeScript

Testing

Deployment

Projects

48. USER EXPERIENCE PRIORITY

The most important UX principle is:

A student should NEVER wonder:

"What am I supposed to do next?"

Every dashboard should clearly show the next recommended action.

Examples:

Continue Lesson

Complete Challenge

Attend Class

Submit Project

Review Feedback

49. PRODUCT PHILOSOPHY

Do NOT make TechEdu feel like traditional school management software.

Avoid:

Huge tables everywhere

Cluttered dashboards

Overwhelming menus

Outdated school portal designs

Excessive statistics

Instead make it feel like:

A modern developer platform combined with a learning environment.

Fast.

Focused.

Motivating.

Beautiful.

Professional.

50. MVP PRIORITY

Although this specification describes the long-term product vision, prioritize building the prototype around:

Authentication UI

Student Dashboard

Attendance

Learning Paths

Subjects

Topics

Lessons

Student Profile

Projects

Settings

Build the remaining functionality as either lightweight prototypes, placeholders, or reusable architecture that can be expanded later.

Do NOT sacrifice the quality of the core experience to implement every future feature.

The MVP should feel complete even before those future features are activated.

The final result should look and behave like a real production-ready SaaS application rather than a collection of disconnected page mockups.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://acadevo-os.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e432dc01-5e30-4439-98ac-b223cc1724f9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
