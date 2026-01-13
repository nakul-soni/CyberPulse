# CyberPulse Quick Start

Get CyberPulse running in 5 minutes.

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Groq API key (free at https://console.groq.com)

## Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp env.example .env.local
# Edit .env.local with your database and API key

# 3. Create database
createdb cyberpulse

# 4. Run migration
npm run db:migrate

# 5. Start the app
npm run dev

# 6. Ingest incidents (in another terminal)
npm run ingest
```

Visit http://localhost:3000

## Environment Variables

Minimum required in `.env.local`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cyberpulse
DB_USER=postgres
DB_PASSWORD=your_password
GROQ_API_KEY=your_groq_key
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Start production server

# Database
npm run db:migrate      # Run database migration

# Ingestion
npm run ingest          # Manual ingestion
npm run worker          # Background worker (scheduled)
```

## First Run Checklist

- [ ] PostgreSQL is running
- [ ] Database `cyberpulse` exists
- [ ] `.env.local` is configured
- [ ] Migration completed successfully
- [ ] Groq API key is valid
- [ ] Ingestion ran without errors
- [ ] Dashboard shows incidents

## Troubleshooting

**No incidents showing?**
- Run `npm run ingest` manually
- Check database: `psql -d cyberpulse -c "SELECT COUNT(*) FROM incidents;"`

**Database connection error?**
- Verify PostgreSQL is running: `pg_isready`
- Check `.env.local` credentials

**AI analysis failing?**
- Verify `GROQ_API_KEY` in `.env.local`
- Check Groq console for rate limits

For detailed setup, see [SETUP.md](./SETUP.md)
