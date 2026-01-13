/**
 * AI Analysis Agent
 * 
 * Responsibilities:
 * - Generate structured AI analysis for incidents
 * - Classify attack types
 * - Determine severity levels
 * - Generate mitigation steps
 */

export interface AIAnalysis {
  summary: string;
  attack_type: string;
  severity: 'Low' | 'Medium' | 'High';
  root_cause: string;
  mistakes: string[];
  mitigation: string[];
  what_to_do_guide: string;
  why_it_matters: string;
  risk_score: number;
  case_study: {
    title: string;
    background: string;
    incident_flow: string[];
    outcome: string;
    lessons_learned: string[];
  };
}

export class AIAnalysisAgent {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }
  }

  /**
   * Analyze an incident using AI
   */
  async analyzeIncident(
    title: string,
    description: string
  ): Promise<AIAnalysis | null> {
    const prompt = this.buildPrompt(title, description);
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a senior cybersecurity analyst. Your goal is to convert complex cyber news into actionable intelligence. Always respond with valid JSON only, no preamble or explanation.',
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
        console.error('AI API error:', error);
        return null;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        console.error('No content in AI response');
        return null;
      }

      const analysis = JSON.parse(content) as AIAnalysis;
      
      // Validate and normalize the response
      return this.validateAndNormalize(analysis);
    } catch (error: any) {
      console.error('AI Analysis failed:', error.message);
      return null;
    }
  }

  /**
   * Build the analysis prompt
   */
  private buildPrompt(title: string, description: string): string {
    return `
Analyze the following cybersecurity incident and provide a structured JSON response.

Incident Title: ${title}
Incident Description: ${description || 'No description available'}

The response MUST be a valid JSON object matching this exact structure:
{
  "summary": "A plain-English, easy-to-understand summary (2-3 sentences). Avoid jargon.",
  "attack_type": "Classification (e.g., ransomware, data breach, zero-day, phishing, DDoS, malware, APT, etc.)",
  "severity": "Low | Medium | High",
  "root_cause": "Brief explanation of what went wrong and how the attack succeeded",
  "mistakes": ["Mistake 1", "Mistake 2", "Mistake 3"],
  "mitigation": ["Step 1: Actionable mitigation step", "Step 2: Another step", "Step 3: Final step"],
  "what_to_do_guide": "A practical guide for the user if they were affected or want to prevent this type of attack",
  "why_it_matters": "One clear sentence explaining the significance of this incident",
  "risk_score": 75,
  "case_study": {
    "title": "A catchy, descriptive title for this case study",
    "background": "Context about the victim organization/environment and why they were targeted",
    "incident_flow": ["Event 1: What happened first", "Event 2: What happened next", "Event 3: Final event"],
    "outcome": "Final result - what happened to the victim, data lost, systems affected, etc.",
    "lessons_learned": ["Lesson 1", "Lesson 2", "Lesson 3"]
  }
}

Constraints:
- Severity must be exactly one of: Low, Medium, High
- risk_score must be an integer between 0 and 100
- All arrays must have at least 2 items
- No raw LLM preamble or postamble - JSON only
- Explanations must be clear and actionable
- Assume the user is technical but not a SOC expert
`;
  }

  /**
   * Validate and normalize AI response
   */
  private validateAndNormalize(analysis: any): AIAnalysis {
    // Ensure severity is valid
    const severity = ['Low', 'Medium', 'High'].includes(analysis.severity)
      ? analysis.severity
      : 'Medium';

    // Ensure risk_score is valid
    const riskScore = typeof analysis.risk_score === 'number'
      ? Math.max(0, Math.min(100, analysis.risk_score))
      : 50;

    // Ensure arrays exist
    const mistakes = Array.isArray(analysis.mistakes) ? analysis.mistakes : [];
    const mitigation = Array.isArray(analysis.mitigation) ? analysis.mitigation : [];
    const incidentFlow = Array.isArray(analysis.case_study?.incident_flow)
      ? analysis.case_study.incident_flow
      : [];
    const lessonsLearned = Array.isArray(analysis.case_study?.lessons_learned)
      ? analysis.case_study.lessons_learned
      : [];

    return {
      summary: analysis.summary || 'Analysis pending',
      attack_type: analysis.attack_type || 'Unclassified',
      severity,
      root_cause: analysis.root_cause || 'Analysis pending',
      mistakes: mistakes.length > 0 ? mistakes : ['Analysis pending'],
      mitigation: mitigation.length > 0 ? mitigation : ['Analysis pending'],
      what_to_do_guide: analysis.what_to_do_guide || 'Analysis pending',
      why_it_matters: analysis.why_it_matters || 'Analysis pending',
      risk_score: riskScore,
      case_study: {
        title: analysis.case_study?.title || 'Case Study',
        background: analysis.case_study?.background || 'Analysis pending',
        incident_flow: incidentFlow.length > 0 ? incidentFlow : ['Analysis pending'],
        outcome: analysis.case_study?.outcome || 'Analysis pending',
        lessons_learned: lessonsLearned.length > 0 ? lessonsLearned : ['Analysis pending'],
      },
    };
  }
}
