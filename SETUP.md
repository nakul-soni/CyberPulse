# CyberPulse Setup Guide

Step-by-step instructions to get CyberPulse running on your machine.

## Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** installed ([Download](https://nodejs.org/))
2. **PostgreSQL 12+** installed and running ([Download](https://www.postgresql.org/download/))
3. **Groq API Key** ([Get Free Key](https://console.groq.com))

## Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Next.js and React
- PostgreSQL client (pg)
- RSS parser
- AI analysis dependencies
- TypeScript and build tools

## Step 2: Set Up PostgreSQL

### Option A: Local PostgreSQL

1. **Start PostgreSQL service:**
   ```bash
   # macOS (Homebrew)
   brew services start postgresql
   
   # Linux (systemd)
   sudo systemctl start postgresql
   
   # Windows
   # Start PostgreSQL service from Services app
   ```

2. **Create database:**
   ```bash
   createdb cyberpulse
   ```

   Or using psql:
   ```bash
   psql -U postgres
   CREATE DATABASE cyberpulse;
   \q
   ```

### Option B: Docker PostgreSQL

```bash
docker run --name cyberpulse-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cyberpulse \
  -p 5432:5432 \
  -d postgres:15
```

## Step 3: Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp env.example .env.local
   ```

2. **Edit `.env.local` with your settings:**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=cyberpulse
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   
   # AI API Configuration
   GROQ_API_KEY=your_groq_api_key_here
   
   # Optional: Ingestion Schedule
   INGESTION_CRON_SCHEDULE=0 */6 * * *
   RUN_INGESTION_ON_STARTUP=true
   ```

### Getting a Groq API Key

1. Visit https://console.groq.com
2. Sign up for a free account
3. Navigate to API Keys
4. Create a new API key
5. Copy the key to `.env.local`

**Note:** Groq offers a generous free tier, perfect for personal use.

## Step 4: Run Database Migration

Create the database schema:

```bash
npm run db:migrate
```

This creates all necessary tables and indexes. You should see:
```
✅ Database migration completed successfully!
```

## Step 5: Start the Application

### Development Mode

```bash
npm run dev
```

Visit http://localhost:3000

You should see the CyberPulse dashboard (empty initially).

### Production Mode

```bash
npm run build
npm start
```

## Step 6: Ingest Your First Incidents

### Option A: Manual Ingestion (Recommended for First Run)

```bash
npm run ingest
```

This will:
1. Fetch RSS feeds from configured sources
2. Deduplicate incidents
3. Insert new incidents into the database
4. Trigger AI analysis (async)

### Option B: Via API

```bash
curl http://localhost:3000/api/ingest
```

### Option C: Automatic Scheduled Ingestion

Run the background worker:

```bash
npm run worker
```

This starts a background process that:
- Runs ingestion on a schedule (default: every 6 hours)
- Can optionally run on startup

**Note:** Keep this process running for automatic updates.

## Step 7: Verify Installation

1. **Check the dashboard:**
   - Visit http://localhost:3000
   - You should see incident cards (if ingestion ran successfully)

2. **Check database:**
   ```bash
   psql -d cyberpulse -c "SELECT COUNT(*) FROM incidents;"
   ```

3. **Check ingestion logs:**
   ```bash
   psql -d cyberpulse -c "SELECT * FROM ingestion_logs ORDER BY started_at DESC LIMIT 5;"
   ```

## Troubleshooting

### Database Connection Issues

**Error:** `Connection refused` or `ECONNREFUSED`

**Solutions:**
1. Verify PostgreSQL is running:
   ```bash
   pg_isready
   ```

2. Check connection details in `.env.local`

3. Verify database exists:
   ```bash
   psql -l | grep cyberpulse
   ```

4. Test connection manually:
   ```bash
   psql -h localhost -U postgres -d cyberpulse
   ```

### AI Analysis Failing

**Error:** `GROQ_API_KEY is not set` or API errors

**Solutions:**
1. Verify `GROQ_API_KEY` is set in `.env.local`
2. Check API key is valid at https://console.groq.com
3. Verify you haven't exceeded rate limits (check Groq dashboard)
4. Check console logs for specific error messages

### No Incidents Appearing

**Possible Causes:**
1. Ingestion hasn't run yet → Run `npm run ingest`
2. All items were duplicates → Check ingestion logs
3. RSS feeds are down → Check feed URLs in `src/agents/news-ingestion-agent.ts`
4. Database connection issue → Check database logs

**Debug:**
```bash
# Check incidents in database
psql -d cyberpulse -c "SELECT title, status, severity FROM incidents LIMIT 10;"

# Check ingestion logs
psql -d cyberpulse -c "SELECT * FROM ingestion_logs ORDER BY started_at DESC;"
```

### TypeScript/Module Errors

**Error:** `Cannot find module` or TypeScript errors

**Solutions:**
1. Ensure all dependencies are installed: `npm install`
2. For scripts, ensure `tsx` is installed: `npm install -g tsx`
3. Try using `npx tsx` instead:
   ```bash
   npx tsx scripts/ingest.js
   ```

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solutions:**
1. Kill the process using port 3000:
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. Or use a different port:
   ```bash
   PORT=3001 npm run dev
   ```

## Next Steps

Once everything is working:

1. **Customize RSS Sources:** Edit `src/agents/news-ingestion-agent.ts`
2. **Adjust Ingestion Schedule:** Edit `.env.local`
3. **Explore the API:** Check `README.md` for API documentation
4. **Read Architecture:** See `ARCHITECTURE.md` for system design

## Production Deployment

For production deployment:

1. **Set up PostgreSQL** (self-hosted or managed)
2. **Configure environment variables** in production
3. **Run migration:** `npm run db:migrate`
4. **Build and deploy Next.js app** (Vercel, Railway, etc.)
5. **Set up background worker** (systemd, PM2, etc.)

See `README.md` for more deployment details.

## Getting Help

If you encounter issues:

1. Check the error logs in console
2. Review database logs
3. Verify all environment variables are set
4. Check the troubleshooting section above
5. Open an issue on GitHub

---

**Happy threat hunting! 🛡️**
