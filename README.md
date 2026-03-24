# Baajit

A task and habit management app designed specifically for ADHD brains. Built with Tauri, React, and SQLite for a fast, local-first experience on desktop and mobile.

## Why Baajit?

Traditional productivity apps assume a neurotypical brain. Baajit takes a different approach — it meets you where you are with energy-aware task suggestions, gentle transition prompts, sensory grounding exercises, and a rabbit mascot that grows alongside your progress.

## Features

**Core Task & Habit Management** — Create tasks with due dates and energy tags, build habits with streak tracking, and archive completed work. A calendar view ties everything together across days and weeks.

**Rabbit Progression System** — Your rabbit companion levels up as you complete tasks, log habits, and track moods. Five growth stages from tiny kit to majestic elder, each with unique outfits and encouraging messages. XP is earned across everything you do in the app.

**Focus Timer** — A simple, distraction-free timer with preset durations (5, 15, 25, 45 minutes) and XP rewards for completed sessions. No complicated Pomodoro setup — just pick a time and go.

**Brain Dump** — Quick-capture space for getting thoughts out of your head and into a safe place. Tag dumps by category and optionally convert them into actionable tasks.

**Task Breakdown Assistant** — When a task feels too big, break it into numbered mini-steps with coaching from your rabbit. Each step becomes its own task so nothing gets lost.

**Energy Level Tracking** — Daily check-in with five energy levels (depleted through supercharged). The app adapts its suggestions based on how you're feeling — low energy days get gentler nudges.

**Sensory Grounding Exercises** — Three guided exercises for moments when focus slips: box breathing with a visual progress ring, the 5-4-3-2-1 sensory technique, and a quick body scan. All accessible from the main navigation.

**Transition Prompts** — Gentle rabbit messages that appear between completed tasks and habits, helping with the ADHD challenge of switching contexts.

**Mood Tracking** — Log your mood throughout the day with five options and optional notes. Mood data earns XP and feeds into your overall progress.

## Tech Stack

- **Framework**: [Tauri v2](https://v2.tauri.app/) (Rust backend, web frontend)
- **Frontend**: React 19 + TypeScript
- **Routing**: TanStack Router
- **Data**: TanStack React Query + SQLite via `@tauri-apps/plugin-sql`
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Icons**: Phosphor Icons
- **Build**: Vite 7

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install)
- Tauri v2 system dependencies ([see Tauri docs](https://v2.tauri.app/start/prerequisites/))

### Development

```shell
pnpm install
pnpm tauri dev
```

This opens the app in a native desktop window. The app requires the Tauri shell to function — it won't work in a plain browser tab since it relies on native SQLite access.

### Build

```shell
pnpm tauri build
```

### Android

**One-time setup:**

```shell
keytool -genkey -v -keystore ./src-tauri/gen/android/local-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias upload

cp src-tauri/gen/android/key.properties{.sample,}
# Edit password & keyAlias fields in key.properties
```

**Build:**

```shell
pnpm tauri android build
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── rabbit-mascot.tsx       # SVG rabbit with level-based outfits
│   ├── task-breakdown.tsx      # Break tasks into mini-steps
│   ├── energy-check-in.tsx     # Daily energy level dialog
│   ├── transition-prompt.tsx   # Between-task nudges
│   ├── mood-tracker-form.tsx   # Mood logging form
│   └── bottom-navigation.tsx   # 5-tab bottom nav
├── routes/           # TanStack Router file-based routes
│   ├── index.tsx              # Dashboard / home
│   ├── welcome.tsx            # First-launch onboarding
│   ├── focus.tsx              # Focus timer
│   ├── braindump.tsx          # Brain dump capture
│   ├── grounding.tsx          # Sensory grounding exercises
│   └── ...                    # Calendar, mood, task editing
├── hooks/            # Data hooks (tasks, habits, moods, focus, braindump)
├── lib/              # Database setup, utilities
└── types/            # TypeScript type definitions
src-tauri/            # Rust backend + SQLite migrations
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on getting started, making changes, and what kinds of contributions are most helpful.

## License

This project is licensed under the [MIT License](LICENSE).
