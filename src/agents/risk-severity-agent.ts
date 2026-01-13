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
    let riskScore = analysis.risk_score || 50;
    const factors: string[] = [];

    // Adjust based on attack type
    const highRiskTypes = ['ransomware', 'apt', 'zero-day', 'data breach'];
    const attackTypeLower = analysis.attack_type.toLowerCase();
    
    if (highRiskTypes.some(type => attackTypeLower.includes(type))) {
      riskScore += 15;
      factors.push(`High-risk attack type: ${analysis.attack_type}`);
    }

    // Adjust based on severity
    if (analysis.severity === 'High') {
      riskScore += 20;
      factors.push('High severity classification');
    } else if (analysis.severity === 'Medium') {
      riskScore += 5;
      factors.push('Medium severity classification');
    }

    // Adjust based on number of mistakes (more mistakes = higher risk)
    if (analysis.mistakes.length >= 3) {
      riskScore += 10;
      factors.push('Multiple security mistakes identified');
    }

    // Normalize risk score
    riskScore = Math.max(0, Math.min(100, riskScore));

    // Determine final severity if not already set
    let severity = analysis.severity;
    if (riskScore >= 70) {
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
