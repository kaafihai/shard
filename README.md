# Baajit

A task and habit management app designed specifically for ADHD brains. Built with Tauri, React, and SQLite for a fast, local-first experience on desktop and mobile.

## The Story

My eldest child used to say "Baajit" instead of "rabbit" when they were a baby. Fully smart at two; and quirks that I never got fully as a young mom. It stuck with me — that word, that voice, the way a kid's pronunciation becomes its own thing entirely. Years later, I learned they have ADHD. And I was diagnosed with AUDHD as an adult.

That's where the name comes from. And that's why this app exists.

For years I tried every productivity app I could find. None of them worked. They were built for brains that work differently from mine — neurotypical brains. The problem was never knowing what to do. The problem was the space between knowing and doing. It's the task that feels too big to start. It's finishing one thing and getting stuck instead of moving to the next. It's the racing thoughts that won't quiet down. It's sensory overwhelm, executive dysfunction, rejection sensitivity, time blindness, and a hundred other things that neurotypical systems just don't account for.

I didn't need another app that told me what to do. I needed one that understood why I couldn't.

**Read the full launch note:** [Why I Built Baajit](play-store/LAUNCH_NOTE.md)
**v1.1 Features & Details:** [Habit Formation Enhancements](V1_1_FEATURES.md)

## Thank You to Kaafihai Founders

This app would not exist without the vision and patience of **Sahiti [itihas], Azan, and Kaustubh** at Kaafihai. They listened to my neurodivergent rants, encouraged me to learn to code, and helped shape this idea from clay into a first cut. Thank you for creating space for this, believing in the mission, and building something that matters for neurodivergent minds. 💚

## Why Baajit?

Baajit takes a different approach — it meets you where you are with energy-aware task suggestions, gentle transition prompts, sensory grounding exercises, and a rabbit mascot that grows alongside your progress. Every feature exists because of a specific neurodivergent challenge I've lived with.

## Features

**Core Task & Habit Management** — Create tasks with due dates and energy tags, build habits with streak tracking, and archive completed work. A calendar view ties everything together across days and weeks.

**Rabbit Progression System** — Your rabbit companion levels up as you complete tasks, log habits, and track moods. Five growth stages from tiny kit to majestic elder, each with unique outfits and encouraging messages. XP is earned across everything you do in the app.

### ✨ v1.1 Features (Habit Formation Enhancements)

**Time-of-Day Cues** — Set when each habit fits your natural rhythm: 🌅 morning, ☀️ afternoon, 🌙 evening, or ⏰ anytime. Match habits to your energy patterns throughout the day.

**Energy-Aware Smart Suggestions** — The app analyzes your mood and suggests habits that match your current energy level. Low energy days get gentle 5-10 minute tasks; high energy days unlock bigger challenges. Finally, a system that meets you where you are, not where you "should" be.

**Gentle Notifications** — Optional, non-intrusive reminders at times you choose. No aggressive pings — just kind nudges to keep you on track without the stress.

**Rabbit Emotions** — Your rabbit's mood reflects your actual activity and emotional state. Watch them be 👑 proud when you crush your day, 😴 tired when you need rest, or 🤔 confused when life gets mixed signals. Real emotional validation from a pixel friend.

### Core Features

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

## Download & Run Baajit

### Desktop (macOS, Windows, Linux)

#### Quick Download

**macOS (v1.1.0):**
[⬇️ Download Baajit for Mac](https://github.com/kaafihai/shard/releases/download/v1.1.0/baajit_1.1.0_aarch64.dmg) (38 MB)

Windows and Linux builds coming soon. Check the [Releases](https://github.com/kaafihai/shard/releases) page for updates.

#### Build From Source
If you want the latest version or prefer to build it yourself, see the Getting Started section below.

### Mobile (Android & iOS)

#### Android (v1.1.0)
[⬇️ Download Baajit for Android](https://github.com/kaafihai/shard/releases/download/v1.1.0/app-universal-release-unsigned.apk) (54.8 MB)

To install on your device:
1. Download the APK file
2. Transfer to your Android device or download directly on it
3. Open Settings → Security → Enable "Unknown Sources"
4. Open the APK file and tap "Install"
5. Launch Baajit!

**Future:** Baajit will be available on Google Play Store for easier discovery and updates.

#### iOS (Coming Soon)
iOS version coming after Android is stable. Will be available on Apple App Store.

#### Build Mobile From Source
For developers who want to build Android or iOS versions themselves, see the Android/iOS sections under Getting Started.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install)
- Tauri v2 system dependencies ([see Tauri docs](https://v2.tauri.app/start/prerequisites/))

### Build & Run From Source

**Clone the repository:**

```shell
git clone https://github.com/kaafihai/shard.git
cd shard
```

**Install dependencies:**

```shell
pnpm install
```

**Run in development mode:**

```shell
pnpm tauri dev
```

This opens Baajit in a native desktop window. The app requires the Tauri shell to function — it won't work in a browser tab since it relies on native SQLite access for local data storage.

### Create a Standalone Executable

To build a standalone app for your system:

```shell
pnpm tauri build
```

The built app will be in `src-tauri/target/release/bundle/`. You can then run it directly from there or install it on your system.

### Android

**One-time setup:**

```shell
# set these:
keyAlias=upload
password=upload-password
keystorePath="$(pwd)/local-keystore.jks"

# then run:
keytool -genkey -v -keystore $keystorePath \
  -keyalg RSA -keysize 2048 -validity 10000 -alias $keyAlias

echo "keyAlias=$keyAlias" > keystore.properties
echo "password=$password" >> keystore.properties
echo "storeFile=$keystorePath" >> keystore.properties
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
