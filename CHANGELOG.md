# Changelog

All notable changes to Baajit are documented here.

---

## v1.0.1 — Polish (March 23, 2026)

### Improved

- **Welcome page carrot field** — Completely redrawn SVG with golden-hour sky, sun rays, wooden fence on distant hills, a tiny tree, wildflower clusters, two animated butterflies, pulsing fireflies, and twinkling sparkle stars. 8 carrot plants per row (up from 6) with fuller leafy fronds.
- **Brain Dump explainer** — Added a "How Brain Dump works" section at the bottom of the dump page explaining that Tasks get added to your list, while Notes and Later items are just for clearing your head.

### Fixed

- Welcome page redirect now properly re-evaluates on navigation changes (added missing useEffect dependencies).
- Unknown habit frequency types now default to "not scheduled" instead of incorrectly appearing on every day.
- Mood form submit handler now validates selection even if the button guard is bypassed.

### Added

- MIT License
- CONTRIBUTING.md with guidelines for ADHD-friendly design contributions
- Comprehensive README with setup instructions, feature overview, and project structure
- Play Store listing text, privacy policy, and launch note
- `.gitignore` entries for Android signing keys and build artifacts

---

## v1.0.0 — First Release (March 2026)

Baajit is a task and habit management app built specifically for ADHD brains. Local-first, privacy-respecting, and designed to work with the way your brain actually works — not against it.

### Features

1. **Task Management** — Create, edit, complete, and archive tasks with due dates and energy-level tags. Swipe-friendly mobile layout with quick-add from the dashboard.

2. **Habit Tracking** — Build habits with flexible scheduling (daily, specific weekdays, or custom). Streak tracking with calendar heatmaps and detailed stats per habit.

3. **Mood Logging** — Five-level mood check-in (Great through Terrible) with optional notes. Prompted on each visit so you build the habit without thinking about it.

4. **Rabbit Progression System** — A companion rabbit that grows from tiny kit to majestic elder across 5 levels. Earns XP from everything you do: tasks (5 XP), habits (3 XP), moods (2 XP), focus sessions (8 XP), and brain dumps (4 XP). Unlockable outfits as milestone rewards.

5. **Focus Timer** — Distraction-free timer with preset durations (5, 15, 25, 45 minutes). No complicated setup — pick a time and start. Earns XP on completion.

6. **Brain Dump** — Quick-capture space for getting racing thoughts out of your head. Tag by category and optionally convert dumps into actionable tasks.

7. **Task Breakdown Assistant** — When a task feels overwhelming, break it into numbered mini-steps with coaching from your rabbit. Each step becomes its own trackable task.

8. **Energy Level Tracking** — Daily check-in across five levels (Depleted through Supercharged). The dashboard adapts suggestions based on your current energy.

9. **Sensory Grounding Exercises** — Three guided exercises for when focus slips: box breathing with a visual progress ring, the 5-4-3-2-1 sensory technique, and a quick body scan.

10. **Transition Prompts** — Gentle rabbit messages between completed tasks and habits, helping with the ADHD challenge of switching contexts without getting stuck.

11. **Calendar View** — Day and week views showing tasks, habits, and mood entries together. Tap any day to see what happened or what's coming up.

12. **Welcome Experience** — First-launch onboarding with an illustrated carrot field scene introducing Baajit's approach and your rabbit companion.

### Technical

- Built with Tauri v2 (desktop + mobile), React 19, TypeScript, and SQLite
- All data stored locally on your device — nothing leaves your machine
- TanStack Router for navigation, TanStack React Query for data management
- Tailwind CSS v4 with shadcn/ui components
- Phosphor Icons throughout

---

## Pre-release History

### Phase 2 — ADHD-Specific Tools (March 2026)

- Focus Timer with preset durations and XP rewards
- Brain Dump quick-capture with sort-and-categorize flow
- Task Breakdown Assistant with rabbit coaching
- Energy Level Tracking with daily check-in and dashboard adaptation
- Sensory Grounding Exercises (box breathing, 5-4-3-2-1, body scan)
- Transition Prompts between completed tasks
- 5-tab bottom navigation (Calendar, Tasks, Focus, Dump, Profile)

### Phase 1 — Core Experience (March 2026)

- Rabbit mascot with 5 growth levels and XP progression
- Unlockable outfits (scarf, glasses, badge, hat, cape) tied to milestones
- Warm color palette with illustrated welcome page
- Mood tracker with aging reminders
- Streak rewards for habit consistency
- App renamed from SharD to Nibble, later to Baajit

### Foundation (February–March 2026)

- Tauri v2 scaffold with React, TypeScript, Vite
- SQLite database with migrations for tasks, habits, moods, and entries
- Task CRUD with due dates, completion, archiving, and cancellation
- Habit system with RRULE scheduling and calendar backpopulation
- Mood tracker with 5 mood levels and notes
- Calendar view with day and week modes
- Android build setup with keystore configuration
- Nix flake for reproducible development environment
