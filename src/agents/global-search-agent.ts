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

  async searchGlobalAttack(query: string): Promise<GlobalSearchIncident[]> {
    if (!this.apiKey) return [];

    try {
      const prompt = `
        You are a Cyber Security Expert and Historian. 
        The user is searching for cyber attacks or case studies related to: "${query}".
        
        Provide a list of up to 5 of the most relevant, famous, or significant cyber attacks or case studies (historical or recent) that match this query.
        
        IMPORTANT: 
        - If the query is specific (e.g., "Stuxnet"), include that specific attack plus any related or similar major incidents.
        - If the query is broad (e.g., "Ransomware case studies"), provide the most iconic and historically significant examples (e.g., WannaCry, NotPetya, Colonial Pipeline).
        - Ensure HIGH QUALITY, ACCURATE data for each entry.
        
        Return the response in the following JSON format ONLY:
        {
          "incidents": [
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
          ]
        }

        If no relevant attacks are found, return an empty list for "incidents".
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
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) return [];

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (!content) return [];

      const result = JSON.parse(content);
      if (!result || !Array.isArray(result.incidents)) return [];

      return result.incidents.filter((inc: any) => inc.title && inc.title !== "null");
    } catch (error) {
      console.error('GlobalSearchAgent Error:', error);
      return [];
    }
  }
}
