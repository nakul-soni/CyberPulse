/**
 * Risk & Severity Assessment Agent
 * 
 * Responsibilities:
 * - Validate and refine severity assessments
 * - Calculate risk scores based on multiple factors
 * - Provide risk context
 */

import { AIAnalysis } from './ai-analysis-agent';

export interface RiskAssessment {
  severity: 'Low' | 'Medium' | 'High';
  risk_score: number;
  factors: string[];
}

export class RiskSeverityAgent {
  /**
   * Assess risk based on AI analysis and additional factors
   */
    assessRisk(analysis: AIAnalysis, metadata?: {
      source?: string;
      region?: string;
      publishedAt?: Date;
    }): RiskAssessment {
      // Start with a lower base score to allow for better distribution
      let riskScore = 25;
      const factors: string[] = [];

      // Adjust based on attack type
      const highRiskTypes = ['ransomware', 'apt', 'zero-day', 'supply chain', 'critical infrastructure'];
      const mediumRiskTypes = ['vulnerability', 'phishing', 'data leak', 'malware'];
      const attackTypeLower = analysis.attack_type.toLowerCase();
      
      if (highRiskTypes.some(type => attackTypeLower.includes(type))) {
        riskScore += 25;
        factors.push(`High-risk attack type: ${analysis.attack_type}`);
      } else if (mediumRiskTypes.some(type => attackTypeLower.includes(type))) {
        riskScore += 10;
        factors.push(`Medium-risk attack type: ${analysis.attack_type}`);
      }

      // Adjust based on AI-determined severity
      if (analysis.severity === 'High') {
        riskScore += 35;
        factors.push('AI-classified High severity');
      } else if (analysis.severity === 'Medium') {
        riskScore += 15;
        factors.push('AI-classified Medium severity');
      }

      // Adjust based on number of mistakes (more mistakes = higher risk)
      if (analysis.mistakes.length >= 3) {
        riskScore += 15;
        factors.push('Multiple security failures identified');
      } else if (analysis.mistakes.length > 0) {
        riskScore += 5;
        factors.push('Security mistakes identified');
      }

      // Normalize risk score
      riskScore = Math.max(0, Math.min(100, riskScore));

      // Determine final severity with more balanced thresholds
      let severity: 'Low' | 'Medium' | 'High';
      if (riskScore >= 75) {
        severity = 'High';
      } else if (riskScore >= 40) {
        severity = 'Medium';
      } else {
        severity = 'Low';
      }

    return {
      severity,
      risk_score: Math.round(riskScore),
      factors,
    };
  }

  /**
   * Get risk level description
   */
  getRiskDescription(riskScore: number): string {
    if (riskScore >= 70) {
      return 'High risk - Immediate attention recommended';
    } else if (riskScore >= 40) {
      return 'Medium risk - Monitor and prepare';
    } else {
      return 'Low risk - Awareness recommended';
    }
  }
}
