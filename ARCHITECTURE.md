# CyberPulse Architecture

## System Overview

CyberPulse is built as a modular, agent-based system that processes cybersecurity news into actionable intelligence. The architecture prioritizes clarity, maintainability, and scalability.

## Design Philosophy

1. **Simplicity Over Complexity**: Each component has a single, clear responsibility
2. **Agent-Based Logic**: Logical separation of concerns, even if implemented in one service
3. **Data-Driven**: All analysis is stored in PostgreSQL for querying and historical analysis
4. **User-Centric**: UI hides complexity, shows only what matters

## Architecture Layers

### 1. Data Ingestion Layer

**Components:**
- `NewsIngestionAgent`: Fetches RSS feeds
- `DeduplicationAgent`: Removes duplicates

**Flow:**
```
RSS Feeds → News Ingestion Agent → Raw Items → Deduplication Agent → Unique Incidents
```

**Key Features:**
- Parallel feed fetching
- Content-based deduplication (hash-based)
- URL-based deduplication
- Error handling and retry logic

### 2. AI Analysis Layer

**Components:**
- `AIAnalysisAgent`: Generates structured analysis
- `RiskSeverityAgent`: Assesses risk
- `CaseStudyAgent`: Enhances case studies

**Flow:**
```
Raw Incident → AI Analysis Agent → Structured Analysis → Risk Assessment → Enhanced Case Study → Database
```

**Key Features:**
- Structured JSON output (no raw LLM dumps)
- Validation and normalization
- Error handling with fallbacks
- Async processing (doesn't block ingestion)

### 3. Data Storage Layer

**Database: PostgreSQL**

**Schema Design:**
- `incidents`: Main table with all incident data
- `ingestion_logs`: Tracks ingestion runs
- Indexes optimized for common queries
- Full-text search support

**Key Design Decisions:**
- JSONB for flexible analysis storage
- Content hash for deduplication
- Timestamps for all events
- Status tracking for async operations

### 4. API Layer

**Components:**
- REST API endpoints in `src/app/api/`
- Database query helpers in `src/lib/db.ts`

**Endpoints:**
- `GET /api/incidents` - List with pagination/filtering
- `GET /api/incidents/[id]` - Get single incident
- `GET /api/ingest` - Trigger ingestion

**Features:**
- Pagination
- Filtering (severity, attack type)
- Full-text search
- Error handling

### 5. Frontend Layer

**Components:**
- Next.js App Router
- Server-side rendering for performance
- Minimal, clean UI

**Pages:**
- `/` - Dashboard with incident cards
- `/incident/[id]` - Detailed incident view

**UI Principles:**
- No clutter
- Progressive disclosure (case studies hidden)
- Clear visual hierarchy
- Mobile-responsive

## Data Flow

### Ingestion Flow

```
1. Scheduled Trigger (Cron) or Manual API Call
   ↓
2. IngestionPipeline.run()
   ↓
3. NewsIngestionAgent.fetchAllFeeds()
   → Fetches all RSS feeds in parallel
   ↓
4. DeduplicationAgent.checkDuplicates()
   → Checks URL and content hash
   ↓
5. For each unique item:
   → Insert into database (status: pending)
   → Trigger async AI analysis
   ↓
6. AI Analysis (async):
   → AIAnalysisAgent.analyzeIncident()
   → RiskSeverityAgent.assessRisk()
   → CaseStudyAgent.enhanceCaseStudy()
   → Update database (status: analyzed)
```

### Query Flow

```
1. User Request
   ↓
2. API Endpoint
   ↓
3. Database Query (with filters/pagination)
   ↓
4. Return JSON Response
   ↓
5. Frontend Renders
```

## Multi-Agent Architecture

### Why Agents?

Agents provide logical separation of concerns, making the system:
- **Maintainable**: Each agent has a clear responsibility
- **Testable**: Agents can be tested independently
- **Extensible**: Easy to add new agents or modify existing ones
- **Debuggable**: Clear boundaries for troubleshooting

### Agent Responsibilities

| Agent | Responsibility | Input | Output |
|-------|---------------|-------|--------|
| News Ingestion | Fetch RSS feeds | RSS URLs | Normalized feed items |
| Deduplication | Remove duplicates | Feed items | Unique items |
| AI Analysis | Generate analysis | Title + Description | Structured JSON |
| Risk Severity | Assess risk | AI Analysis | Risk score + Severity |
| Case Study | Enhance case study | Raw case study | Standardized case study |

### Agent Communication

Agents communicate through:
- **Shared data structures** (TypeScript interfaces)
- **Database** (for persistence)
- **Pipeline orchestrator** (IngestionPipeline)

## Database Design

### Schema Principles

1. **One Row = One Incident**: Avoid over-normalization
2. **JSONB for Flexibility**: Store AI analysis as JSONB
3. **Indexes for Performance**: Index common query fields
4. **Full-Text Search**: Enable PostgreSQL full-text search

### Key Tables

**incidents**
- Stores all incident data
- Analysis stored as JSONB
- Content hash for deduplication
- Status tracking for async operations

**ingestion_logs**
- Tracks ingestion runs
- Statistics (fetched, new, duplicates, failed)
- Error logging

### Indexes

- `published_at DESC` - For chronological listing
- `severity` - For filtering
- `attack_type` - For filtering
- `content_hash` - For deduplication
- `url` - For duplicate checking
- GIN indexes on `analysis` and full-text search

## Error Handling

### Ingestion Errors

- **Feed Fetch Failures**: Logged, doesn't stop other feeds
- **Duplicate Detection**: Silent skip
- **Database Errors**: Logged, item marked as failed
- **AI Analysis Failures**: Logged, incident remains with status "failed"

### API Errors

- **Database Errors**: Return 500 with error message
- **Not Found**: Return 404
- **Validation Errors**: Return 400

## Scalability Considerations

### Current Design

- **Single Instance**: Designed for personal/small team use
- **PostgreSQL**: Handles thousands of incidents efficiently
- **Async Processing**: AI analysis doesn't block ingestion

### Future Scaling

To scale for larger deployments:

1. **Horizontal Scaling**: Add more ingestion workers
2. **Queue System**: Use Redis/RabbitMQ for job queuing
3. **Caching**: Add Redis for frequently accessed data
4. **CDN**: Serve static assets via CDN
5. **Database Replication**: Read replicas for queries

## Security Considerations

### Current Implementation

- **No Authentication**: Designed for personal use
- **Environment Variables**: Sensitive data in `.env.local`
- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: TypeScript types + runtime validation

### Production Hardening

For production deployment:

1. **Add Authentication**: NextAuth.js or similar
2. **Rate Limiting**: Prevent API abuse
3. **HTTPS Only**: Enforce secure connections
4. **Database Security**: Use connection pooling, limit privileges
5. **API Keys**: Secure storage for Groq API key

## Monitoring & Observability

### Current Logging

- Console logs for ingestion pipeline
- Database logs in `ingestion_logs` table
- Error logging in console

### Future Enhancements

- Structured logging (JSON)
- Metrics collection (Prometheus)
- Error tracking (Sentry)
- Performance monitoring (APM)

## Testing Strategy

### Current State

- Manual testing via UI
- Database migration testing
- API endpoint testing

### Recommended Additions

- Unit tests for agents
- Integration tests for pipeline
- E2E tests for UI
- Load testing for API

## Deployment Architecture

### Development

```
Next.js Dev Server (Port 3000)
  ↓
PostgreSQL (Local)
  ↓
Worker Script (Optional, Manual)
```

### Production

```
Next.js App (Vercel/Railway/etc.)
  ↓
PostgreSQL (Self-hosted or Managed)
  ↓
Worker (Systemd/PM2)
```

## Future Architecture Enhancements

1. **Microservices**: Split agents into separate services
2. **Event-Driven**: Use message queue for agent communication
3. **Caching Layer**: Redis for frequently accessed data
4. **Search Engine**: Elasticsearch for advanced search
5. **Real-time Updates**: WebSocket for live incident updates

---

This architecture is designed to be simple, maintainable, and extensible. It prioritizes clarity over complexity while remaining production-ready.
