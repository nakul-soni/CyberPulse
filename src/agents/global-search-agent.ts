import { AIAnalysis } from './ai-analysis-agent';

export interface GlobalSearchIncident {
  title: string;
  description: string;
  content: string;
  source: string;
  url: string;
  published_at: string;
  severity: 'Low' | 'Medium' | 'High';
  attack_type: string;
  risk_score: number;
  region: string;
  analysis: AIAnalysis;
}

export class GlobalSearchAgent {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
  }

  async searchGlobalAttack(query: string): Promise<GlobalSearchIncident | null> {
    if (!this.apiKey) return null;

    try {
      const prompt = `
        You are a Cyber Security Expert and Historian. 
        The user is searching for a specific cyber attack or case study: "${query}".
        
        If this is a real, famous, or significant cyber attack (historical or recent), provide a detailed JSON representation of it.
        If it's not a specific attack, return null.

        IMPORTANT: For "famous" cases (like Stuxnet, WannaCry, SolarWinds, etc.), provide HIGH QUALITY, ACCURATE data.
        
        Return the response in the following JSON format ONLY:
        {
          "title": "Full name of the attack/case",
          "description": "A concise summary of the incident",
          "content": "A detailed 3-4 paragraph technical overview of the attack",
          "source": "Historical Record / Intelligence Briefing",
          "url": "https://en.wikipedia.org/wiki/[Relevant_Page] or a famous security blog URL",
          "published_at": "ISO date of when the attack was first discovered or peaked",
          "severity": "High",
          "attack_type": "The specific type (e.g., Ransomware, APT, Worm, Supply Chain)",
          "risk_score": 95,
          "region": "Global or specific country",
          "analysis": {
            "summary": "AI summary of the attack",
            "threat_actor": "Known group (e.g., Lazarus, Cozy Bear) or 'Unknown'",
            "vulnerabilities": ["CVE-XXXX-XXXX", "description of flaw"],
            "impact": "Detail the financial, operational, or social impact",
            "mitigation_steps": ["What should have been done or was done to stop it"],
            "snapshot": {
              "title": "🛑 ATTACK NAME",
              "date": "YYYY-MM-DD",
              "affected": "Sectors affected",
              "attack_type": "Type",
              "severity": "CRITICAL",
              "status": "Resolved"
            },
            "facts": ["Fact 1", "Fact 2"],
            "relevance": ["Enterprises", "Government"],
            "impact_details": {
              "data": "High",
              "operations": "Total",
              "legal": "High",
              "trust": "Critical"
            },
            "root_cause": ["Cause 1"],
            "attack_path": "Path",
            "mistakes": [],
            "actions": {
              "user": [],
              "organization": []
            },
            "ongoing_risk": {
              "current_risk": "Low",
              "what_to_watch": []
            }
          }
        }

        If the query is too generic or not a specific attack, return null.
      `;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (!content) return null;

      const result = JSON.parse(content);
      if (!result || !result.title || result.title === "null") return null;

      return result;
    } catch (error) {
      console.error('GlobalSearchAgent Error:', error);
      return null;
    }
  }
}
