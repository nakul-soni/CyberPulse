/**
 * AI Analysis Agent
 * 
 * Responsibilities:
 * - Generate structured AI intelligence for incidents
 * - Follow strict Cyber Intelligence Analyst + UX Information Architect guidelines
 */

export interface AIAnalysis {
  snapshot: {
    title: string;
    date: string;
    affected: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'Ongoing' | 'Contained' | 'Investigating' | 'Resolved';
  };
  facts: string[];
  relevance: string[]; // List of categories: Individual users, Enterprises, Developers, Healthcare, Finance, Government
  impact: {
    data: string;
    operations: string;
    legal: string;
    trust: string;
  };
  root_cause: string[];
  attack_path: string; // Launch -> ... -> Impact
  mistakes: {
    title: string;
    explanation: string;
  }[];
  actions: {
    user: string[];
    organization: string[];
  };
  ongoing_risk: {
    current_risk: string;
    what_to_watch: string[];
  };
  // Legacy fields for DB compatibility if needed, but we'll focus on the new ones
  summary: string; 
  attack_type: string;
  severity: 'Low' | 'Medium' | 'High'; 
}

export class AIAnalysisAgent {
  private apiKey: string;
  private models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'];

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }
  }

  async analyzeIncident(
    title: string,
    description: string
  ): Promise<AIAnalysis | null> {
    const prompt = this.buildPrompt(title, description);
    
    for (const model of this.models) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: `You are an expert Cyber Intelligence Analyst. Your goal is to produce factual, action-oriented intelligence summaries.
NON-NEGOTIABLE PRINCIPLES:
- Facts before interpretation: No opinions or generic concern statements.
- Signal over noise: Remove buzzwords, fluff, and marketing language.
- Zero ambiguity: Use clear metadata.
- No generic AI phrasing: Avoid "raises concerns", "robust security", "exercise caution", "enhanced protection".
Always respond with valid JSON only.`,
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          if (error.includes('rate_limit_exceeded')) continue;
          if (error.includes('insufficient_balance') || error.includes('credits_over') || error.includes('limit_exceeded')) {
            console.error('Groq Credit/Limit error:', error);
            throw new Error('GROQ_CREDITS_EXHAUSTED');
          }
          console.error('AI API error:', error);
          continue;
        }

        const data = await response.json() as { choices: Array<{ message: { content: string } }> };
        const content = data.choices[0]?.message?.content;
        
        if (!content) continue;

        const analysis = JSON.parse(content) as AIAnalysis;
        return this.validateAndNormalize(analysis, title);
      } catch (error: any) {
        console.error(`AI Analysis failed with ${model}:`, error.message);
        continue;
      }
    }
    
    return null;
  }

  private buildPrompt(title: string, description: string): string {
    return `
Convert this cyber news article into a clear, factual, action-oriented intelligence summary.

Incident Title: ${title}
Article Content: ${description || 'No description available'}

The response MUST be a valid JSON object matching this exact structure:
{
  "snapshot": {
    "title": "🛑 INCIDENT TITLE (uppercase)",
    "date": "YYYY-MM-DD",
    "affected": "Clear list of entities affected",
    "attack_type": "Ransomware | APT | Phishing | Supply Chain | etc.",
    "severity": "LOW | MEDIUM | HIGH | CRITICAL",
    "status": "Ongoing | Contained | Investigating | Resolved"
  },
  "facts": ["Fact 1", "Fact 2", "Fact 3", "Fact 4"],
  "relevance": ["Individual users", "Enterprises", "Developers", "Healthcare / Finance / Government (only if applicable)"],
  "impact": {
    "data": "Description of data impact (confirmed/potential)",
    "operations": "Description of operational downtime/disruption",
    "legal": "Legal/compliance impact",
    "trust": "Reputational impact"
  },
  "root_cause": ["Root cause 1", "Root cause 2", "Root cause 3"],
  "attack_path": "Launch → Weak Control → Exploitable Condition → Impact",
  "mistakes": [
    { "title": "Mistake Title", "explanation": "1-line explanation" }
  ],
  "actions": {
    "user": ["Action 1", "Action 2"],
    "organization": ["Action 1", "Action 2"]
  },
  "ongoing_risk": {
    "current_risk": "Exploitation ongoing / limited / unknown",
    "what_to_watch": ["Watch item 1", "Watch item 2"]
  }
}

  SEVERITY RULES:
  - LOW: Informational news, patches released with no known exploitation, minor service disruptions, or theoretical vulnerabilities.
  - MEDIUM: Confirmed exploitation with limited scope, exposure of non-sensitive metadata, or localized impact.
  - HIGH: Confirmed data breach of sensitive PII/credentials, active ransomware, or exploitation of critical systems.
  - CRITICAL: Massive global impact, mass exploitation of zero-days in core infrastructure, or life-safety threats.

CONSTRAINTS:
- 2-4 facts max.
- 3 root causes max.
- No analysis, advice, or adjectives in Snapshot.
- Pure incident metadata in Snapshot.
- Use concise bullets everywhere else.
- No generic AI phrasing.
`;
  }

  private validateAndNormalize(analysis: any, originalTitle: string): AIAnalysis {
    // Ensure all fields exist with fallbacks
    const snapshot = analysis.snapshot || {};
    const normalizedSnapshot = {
      title: snapshot.title || `🛑 ${originalTitle.toUpperCase()}`,
      date: snapshot.date || new Date().toISOString().split('T')[0],
      affected: snapshot.affected || 'Unknown',
      attack_type: snapshot.attack_type || 'Unknown',
      severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(snapshot.severity) ? snapshot.severity : 'MEDIUM',
      status: ['Ongoing', 'Contained', 'Investigating', 'Resolved'].includes(snapshot.status) ? snapshot.status : 'Investigating'
    };

    // Legacy support for DB
    const legacySeverityMap: Record<string, 'Low' | 'Medium' | 'High'> = {
      'LOW': 'Low',
      'MEDIUM': 'Medium',
      'HIGH': 'High',
      'CRITICAL': 'High'
    };

    return {
      snapshot: normalizedSnapshot,
      facts: Array.isArray(analysis.facts) ? analysis.facts.slice(0, 4) : ['No facts available'],
      relevance: Array.isArray(analysis.relevance) ? analysis.relevance : ['Enterprises'],
      impact: {
        data: analysis.impact?.data || 'Unknown',
        operations: analysis.impact?.operations || 'None reported',
        legal: analysis.impact?.legal || 'None reported',
        trust: analysis.impact?.trust || 'Minimal'
      },
      root_cause: Array.isArray(analysis.root_cause) ? analysis.root_cause.slice(0, 3) : ['Unknown'],
      attack_path: analysis.attack_path || 'Unknown',
      mistakes: Array.isArray(analysis.mistakes) ? analysis.mistakes : [],
      actions: {
        user: Array.isArray(analysis.actions?.user) ? analysis.actions.user : [],
        organization: Array.isArray(analysis.actions?.organization) ? analysis.actions.organization : []
      },
      ongoing_risk: {
        current_risk: analysis.ongoing_risk?.current_risk || 'Unknown',
        what_to_watch: Array.isArray(analysis.ongoing_risk?.what_to_watch) ? analysis.ongoing_risk.what_to_watch : []
      },
      summary: Array.isArray(analysis.facts) ? analysis.facts.join(' ') : 'No summary available',
      attack_type: normalizedSnapshot.attack_type,
      severity: legacySeverityMap[normalizedSnapshot.severity] || 'Medium'
    };
  }
}
