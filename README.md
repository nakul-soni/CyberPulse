# CyberPulse

**AI-Powered Cyber Threat Intelligence Platform**

CyberPulse is a production-ready web application that automatically collects, analyzes, and presents cybersecurity incidents in an easy-to-understand format. It transforms complex cyber news into actionable intelligence for daily use.

## 🎯 Core Features

- **Automated News Ingestion**: Fetches cyber news from multiple RSS feeds worldwide
- **AI-Powered Analysis**: Uses LLM to generate structured analysis for every incident
- **Intelligent Deduplication**: Removes duplicate incidents across sources
- **Risk Assessment**: Automatically classifies severity and calculates risk scores
- **Case Studies**: Generates detailed case studies for learning
- **Clean UI**: Simple, distraction-free interface optimized for daily use

## 🏗️ Architecture

### Multi-Agent System

CyberPulse uses a logical multi-agent architecture:

1. **News Ingestion Agent** (`src/agents/news-ingestion-agent.ts`)
   - Fetches RSS feeds from multiple sources
   - Parses and normalizes feed items

2. **Deduplication Agent** (`src/agents/deduplication-agent.ts`)
   - Generates content hashes
   - Detects duplicates by URL and content similarity

3. **AI Analysis Agent** (`src/agents/ai-analysis-agent.ts`)
   - Generates structured JSON analysis
   - Classifies attack types
   - Determines severity levels

4. **Risk & Severity Agent** (`src/agents/risk-severity-agent.ts`)
   - Validates severity assessments
   - Calculates risk scores

5. **Case Study Agent** (`src/agents/case-study-agent.ts`)
   - Enhances case study structure
   - Ensures standard template compliance

### Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (self-hosted)
- **AI**: Groq API (free tier available)
- **RSS Parsing**: rss-parser
- **Scheduling**: node-cron

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Groq API key (free at https://console.groq.com)

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd CyberPulse
npm install
```

### Step 2: Database Setup

1. Create PostgreSQL database:

```bash
createdb cyberpulse
```

2. Configure environment variables:

```bash
cp env.example .env.local
```

Edit `.env.local`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cyberpulse
DB_USER=postgres
DB_PASSWORD=your_password
GROQ_API_KEY=your_groq_api_key
```

3. Run database migration:

```bash
npm run db:migrate
```

### Step 3: Run the Application

**Development mode:**

```bash
npm run dev
```

Visit http://localhost:3000

**Production mode:**

```bash
npm run build
npm start
```

## 🔄 Usage

### Manual Ingestion

Trigger ingestion manually:

```bash
npm run ingest
```

Or via API:

```bash
curl http://localhost:3000/api/ingest
```

### Scheduled Ingestion

Run the background worker for scheduled ingestion:

```bash
npm run worker
```

The worker runs ingestion on a schedule (default: every 6 hours). Configure in `.env.local`:

```env
INGESTION_CRON_SCHEDULE=0 */6 * * *  # Every 6 hours
RUN_INGESTION_ON_STARTUP=true        # Run on startup
```

### API Endpoints

- `GET /api/incidents` - List incidents (supports pagination, filtering, search)
- `GET /api/incidents/[id]` - Get incident details
- `GET /api/ingest` - Trigger manual ingestion

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `severity` - Filter by severity (Low/Medium/High)
- `attack_type` - Filter by attack type
- `query` - Full-text search

Example:

```
GET /api/incidents?page=1&limit=20&severity=High&query=ransomware
```

## 📊 Database Schema

### Incidents Table

```sql
- id (UUID, Primary Key)
- title (TEXT)
- description (TEXT)
- content (TEXT)
- url (TEXT, Unique)
- source (TEXT)
- published_at (TIMESTAMP)
- ingested_at (TIMESTAMP)
- status (pending/analyzing/analyzed/failed)
- severity (Low/Medium/High)
- attack_type (VARCHAR)
- risk_score (INTEGER, 0-100)
- analysis (JSONB) - Full AI analysis
- content_hash (VARCHAR) - For deduplication
- region (VARCHAR)
- tags (TEXT[])
- created_at, updated_at (TIMESTAMP)
```

### Ingestion Logs Table

Tracks ingestion runs for monitoring and debugging.

## 🧠 AI Analysis Structure

Each incident gets a structured AI analysis:

```json
{
  "summary": "Plain-English summary",
  "attack_type": "ransomware",
  "severity": "High",
  "root_cause": "Explanation of what went wrong",
  "mistakes": ["Mistake 1", "Mistake 2"],
  "mitigation": ["Step 1", "Step 2", "Step 3"],
  "what_to_do_guide": "Actionable guide for users",
  "why_it_matters": "One-line significance",
  "risk_score": 75,
  "case_study": {
    "title": "Case study title",
    "background": "Context",
    "incident_flow": ["Event 1", "Event 2"],
    "outcome": "Final result",
    "lessons_learned": ["Lesson 1", "Lesson 2"]
  }
}
```

## 🎨 UI Features

### Dashboard

- Incident cards with severity badges
- One-line AI summaries
- Attack type tags
- Source attribution
- Quick navigation to details

### Incident Detail Page

- Full AI analysis
- Root cause explanation
- Key mistakes identified
- Step-by-step mitigation guide
- Personal action guide
- Expandable case study (hidden by default)

## 🔧 Configuration

### RSS Sources

Edit `src/agents/news-ingestion-agent.ts` to add/modify RSS sources:

```typescript
export const RSS_SOURCES: RSSSource[] = [
  {
    name: 'The Hacker News',
    url: 'https://feeds.feedburner.com/TheHackersNews',
    enabled: true,
  },
  // Add more sources...
];
```

### AI Model

Currently uses Groq's `llama-3.3-70b-versatile`. To change, edit `src/agents/ai-analysis-agent.ts`.

## 🚀 Deployment

### Self-Hosted PostgreSQL

1. Install PostgreSQL on your server
2. Create database and user
3. Run migration: `npm run db:migrate`
4. Configure environment variables
5. Deploy Next.js app (Vercel, Railway, etc.)

### Environment Variables

Ensure all required environment variables are set in production:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `GROQ_API_KEY`
- `NEXT_PUBLIC_APP_URL` (for production URL)

### Background Worker

Run the worker as a systemd service or use PM2:

```bash
pm2 start npm --name "cyberpulse-worker" -- run worker
```

## 📈 Future Improvements

- [ ] Add more RSS sources
- [ ] Implement email notifications for high-severity incidents
- [ ] Add incident tagging and categorization
- [ ] Build analytics dashboard
- [ ] Add export functionality (PDF, CSV)
- [ ] Implement user preferences and filters
- [ ] Add incident comparison feature
- [ ] Build mobile app
- [ ] Add multi-language support

## 🛠️ Development

### Project Structure

```
CyberPulse/
├── src/
│   ├── agents/          # Multi-agent architecture
│   ├── app/            # Next.js app router
│   │   ├── api/        # REST API endpoints
│   │   └── incident/   # Frontend pages
│   ├── components/     # React components
│   └── lib/            # Utilities (DB, pipeline)
├── database/           # SQL schema
├── scripts/            # Utility scripts
└── package.json
```

### Adding New Features

1. **New Agent**: Create in `src/agents/`
2. **New API Endpoint**: Add to `src/app/api/`
3. **New UI Component**: Add to `src/components/`
4. **Database Changes**: Update `database/schema.sql` and run migration

## 📝 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## ⚠️ Important Notes

- **Free Tools Only**: This project uses only free/open-source tools
- **No Vendor Lock-in**: PostgreSQL is self-hosted, no cloud dependencies
- **Privacy-First**: All data stays in your database
- **Production-Ready**: Built for daily use, not a demo

## 🆘 Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check environment variables in `.env.local`
- Ensure database exists: `psql -l | grep cyberpulse`

### AI Analysis Failing

- Verify `GROQ_API_KEY` is set correctly
- Check API rate limits (Groq free tier has limits)
- Review error logs in console

### Ingestion Not Working

- Check RSS feed URLs are accessible
- Verify network connectivity
- Review ingestion logs in database: `SELECT * FROM ingestion_logs ORDER BY started_at DESC;`

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for the cybersecurity community**
