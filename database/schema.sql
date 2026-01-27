-- CyberPulse Database Schema
-- PostgreSQL 12+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Incidents table: stores raw and processed cyber incidents
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    url TEXT UNIQUE NOT NULL,
    source TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- AI Analysis fields
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'analyzed', 'failed')),
    severity VARCHAR(10) CHECK (severity IN ('Low', 'Medium', 'High')),
    attack_type VARCHAR(50),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    analysis JSONB,
    
    -- Metadata
    region VARCHAR(100),
    tags TEXT[],
    
    -- Deduplication
    content_hash VARCHAR(64) UNIQUE,
    
    -- Indexes for performance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_incidents_published_at ON incidents(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_attack_type ON incidents(attack_type);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_content_hash ON incidents(content_hash);
CREATE INDEX IF NOT EXISTS idx_incidents_url ON incidents(url);
CREATE INDEX IF NOT EXISTS idx_incidents_analysis_gin ON incidents USING GIN(analysis);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_incidents_title_search ON incidents USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_incidents_description_search ON incidents USING GIN(to_tsvector('english', COALESCE(description, '')));

-- Ingestion logs table: track ingestion runs
CREATE TABLE IF NOT EXISTS ingestion_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    source_name TEXT,
    items_fetched INTEGER DEFAULT 0,
    items_new INTEGER DEFAULT 0,
    items_duplicate INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    error_message TEXT
);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_incidents_updated_at ON incidents;
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
