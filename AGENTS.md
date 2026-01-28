## Project Summary
CyberPulse is a production-ready, AI-powered cyber threat intelligence platform. It aggregates cyber security incidents from various RSS feeds, deduplicates them, and performs deep AI analysis to provide structured intelligence, including attack classification, severity assessment, root cause analysis, and mitigation strategies.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: PostgreSQL (pg)
- **AI**: Groq API
- **Automation**: node-cron, GitHub Actions
- **Utilities**: rss-parser, tsx, lucide-react

## Architecture
- **Multi-Agent System**:
  - `News Ingestion Agent`: Fetches and parses RSS feeds.
  - `Deduplication Agent`: Uses URL and content hashing to prevent duplicates.
  - `AI Analysis Agent`: Generates structured intelligence using LLMs.
  - `Risk Severity Agent`: Assesses impact and assigns severity scores.
  - `Case Study Agent`: Enhances data with historical context.
- **Background Worker**: A standalone script (`scripts/worker.ts`) handles scheduled ingestion and analysis, separate from the Next.js web server.
- **Database Layer**: Centralized PostgreSQL database with JSONB support for flexible AI analysis storage.

## User Preferences
- No comments in code unless explicitly requested.

## Project Guidelines
- **Type Safety**: Use explicit TypeScript types, especially in `catch` blocks (avoid `unknown` errors).
- **Modern Patterns**: Prefer React Server Components (RSC) where possible.
- **Worker Coordination**: The background worker should be triggered via secure API endpoints or internal cron to maintain database reliability.
- **Environment Variables**: Ensure all sensitive keys (GROQ_API_KEY, DATABASE_URL, etc.) are properly managed in `.env.local`.

## Common Patterns
- **API Responses**: Standardized JSON responses for all incident and ingestion endpoints.
- **Error Handling**: Use descriptive console logs with emojis for visibility in deployment logs (e.g., ✅, ❌, ℹ️).
- **Deployment**: Optimized for Railway (worker/database) and Vercel (frontend).
