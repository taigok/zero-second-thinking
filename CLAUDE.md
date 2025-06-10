# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a "Zero Second Thinking" (０秒思考) productivity app built with Next.js 15.2.4, React 19, TypeScript, and shadcn/ui components. The app helps users create rapid-fire memos with a 30-second timer to capture thoughts quickly.

## Commands

```bash
# Development
npm run dev     # Start development server on http://localhost:3000

# Build & Production
npm run build   # Build for production
npm run start   # Start production server

# Code Quality
npm run lint    # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.2.4 with App Router
- **UI Components**: shadcn/ui (complete component library in `components/ui/`)
- **Styling**: Tailwind CSS with custom theme colors and animations
- **State Management**: React hooks with localStorage persistence
- **Language**: TypeScript with strict mode

### Core Application Flow
1. **Main Page** (`app/page.tsx`): Entry point containing the entire application logic
2. **Data Persistence**: All memo data stored in localStorage as JSON
3. **Timer System**: 30-second countdown for each memo creation
4. **Progress Tracking**: Daily memo goals with visual progress indicators

### Key Data Structures
- **Memo**: `{ id, content, createdAt }`
- **Settings**: `{ dailyGoal }` (default: 10 memos/day)
- **LocalStorage Keys**: `memos`, `settings`

### Component Organization
- All UI components are pre-built shadcn/ui components in `components/ui/`
- The main application logic is contained in a single file: `app/page.tsx`
- No custom components outside of the shadcn/ui library

## Development Notes

- The project has ESLint and TypeScript errors ignored during builds (`ignoreBuildErrors: true` in next.config.mjs)
- No testing framework is currently configured
- All styling uses Tailwind CSS utility classes
- Dark mode support is configured but implementation may be incomplete