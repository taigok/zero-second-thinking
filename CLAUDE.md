# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a simple memo-taking app inspired by "Zero Second Thinking" (０秒思考) methodology, built with Next.js 15.2.4, React 19, TypeScript, and minimal shadcn/ui components. The app provides a clean interface for creating memos with title and bullet points in an A4 landscape layout.

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
- **UI Components**: Minimal shadcn/ui (Button, Input, Card only)
- **Styling**: Tailwind CSS with basic styling
- **State Management**: React hooks (useState, useCallback)
- **Language**: TypeScript with strict mode

### Core Application Features
1. **A4 Landscape Layout**: 297mm x 210mm paper-like interface
2. **Title Input**: Single title field with Enter key navigation
3. **Bullet Points**: Dynamic bullet list with keyboard navigation
4. **Keyboard Navigation**: Enter moves to next field (only if current field has content)
5. **Bullet Management**: Add/remove bullets with × button
6. **Reset Function**: Clear all inputs and start fresh

### Key Data Structures
- **Bullet**: `{ id: string, text: string }`
- **State**: `title` (string) and `bullets` (Bullet array)

### Component Organization
- Single file application in `app/page.tsx`
- Minimal UI components: Button, Input only
- No complex state management or timers
- Focus on simplicity and clean code

## Development Principles

### Simplicity First
- **Keep it simple**: Avoid complex abstractions, prefer straightforward implementations
- **Single responsibility**: Each function should do one thing well
- **Minimal dependencies**: Only use necessary libraries and components
- **No premature optimization**: Write clear code first, optimize only when needed

### Code Quality
- **useCallback wisely**: Only memoize functions that are passed as props or used in effects
- **Avoid React.memo**: Keep components simple without unnecessary optimization
- **Clean functions**: Extract reusable logic into well-named helper functions
- **TypeScript**: Use proper typing for better developer experience

### Architecture Guidelines
- **Single file**: Keep the application in one file until complexity requires separation
- **No over-engineering**: Don't add features or abstractions that aren't needed
- **Focus on UX**: Prioritize smooth user interactions and keyboard navigation
- **A4 paper metaphor**: Maintain the clean, paper-like aesthetic

## Development Workflow
- **Auto-commit**: Automatically commit changes when completing user-requested tasks