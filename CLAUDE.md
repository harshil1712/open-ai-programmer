# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm run dev` - Start development server
- `pnpm run build` - Build the application  
- `npm run types` - Run TypeScript type checking
- `npm run check` - Generate types and run type checking
- `npm run worker:run` - Run worker locally
- `npm run migrate:dev` - Apply database migrations locally
- `npm run migrate:prd` - Apply database migrations to production
- `npm run release` - Deploy to production

## Architecture Overview

This is a Cloudflare Workers application built with RedwoodSDK that combines:

- **Frontend**: React with Server Components (RSC) and client components
- **Backend**: Cloudflare Worker with API routes
- **Database**: Prisma with D1 (SQLite)
- **Sandbox**: Cloudflare Container for code execution
- **AI Integration**: OpenAI GPT-4 for code generation

### Key Components

**Worker Architecture** (`src/worker.tsx`):
- Main application entry point handling requests
- Routes static assets and API endpoints
- Integrates with Cloudflare Sandbox for code execution
- Chat API at `/api/chat` processes user messages and generates code

**Client-Server Split**:
- Server components (default): Rendered on server, no client-side JS
- Client components: Must use `"use client"` directive for interactivity
- Server functions: Use `"use server"` directive, execute on server when called from client

**Sandbox Integration** (`src/app/utils/sandbox.ts`):
- Parses AI-generated code in `<file>` tags
- Clones vite-react template and writes generated files
- Manages development server and port exposure

### File Structure

- `src/worker.tsx` - Main worker and routing logic
- `src/client.tsx` - Client initialization
- `src/app/` - React application components
- `src/app/pages/Home.tsx` - Main split-screen interface (chat + preview)
- `src/app/components/` - UI components (Chat, Preview)
- `src/app/utils/sandbox.ts` - Sandbox integration utilities
- `constant.ts` - AI prompt configuration for code generation
- `prisma/schema.prisma` - Database schema (currently minimal)

### Development Notes

- Uses TypeScript with strict type checking
- Path aliases: `@/*` maps to `src/*`, `@generated/*` maps to `generated/*`
- Tailwind CSS v4 for styling
- AI generates React code that gets executed in Cloudflare Sandbox
- Preview runs on exposed sandbox port 8080