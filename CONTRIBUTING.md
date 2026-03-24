# Contributing to Baajit

Thanks for your interest in contributing to Baajit! This app is built to help people with ADHD manage tasks, habits, and energy in a way that works with their brain. Contributions that keep that mission in mind are very welcome.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `pnpm install`
4. Run the development build: `pnpm tauri dev`

You'll need Node.js (v18+), pnpm, Rust, and the Tauri v2 system dependencies installed. See the [Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/) for platform-specific setup.

## Making Changes

1. Create a branch from `main` with a descriptive name (e.g., `fix/streak-calculation` or `feat/dark-mode`)
2. Make your changes
3. Run `npx tsc --noEmit` to check for TypeScript errors
4. Test your changes in the Tauri desktop window (not the browser — Baajit requires the native shell for SQLite access)
5. Commit with a clear message describing what changed and why
6. Open a pull request against `main`

## What to Contribute

Here are some areas where help is especially welcome:

- **Bug fixes** — If something doesn't work right, a fix is always appreciated
- **Accessibility improvements** — Screen reader support, keyboard navigation, color contrast
- **New grounding exercises** — Additional sensory or calming exercises for the grounding page
- **Habit scheduling** — Better RRULE support for monthly or custom recurrence patterns
- **Localization** — Translations for other languages
- **Android and iOS testing** — Reports on how the mobile builds perform on different devices

## Guidelines

- Keep the ADHD-friendly design philosophy in mind. Baajit should feel calm, not overwhelming.
- New features should be simple to use without instructions. If it needs a tutorial, it might be too complex.
- The rabbit companion is a core part of the experience — treat it with care.
- All data must stay local. Do not add analytics, telemetry, cloud sync, or any feature that sends data off-device.
- Use TypeScript for all new code. Avoid `any` types where possible.
- Follow the existing code style — Tailwind for styling, Phosphor for icons, shadcn/ui for components.

## Reporting Issues

Open an issue on GitHub with a clear description of what happened, what you expected, and steps to reproduce. Screenshots are helpful for UI issues.

## Code of Conduct

Be kind, be patient, and remember that many people using this app are navigating real challenges. That same spirit should extend to how we work together on the code.
