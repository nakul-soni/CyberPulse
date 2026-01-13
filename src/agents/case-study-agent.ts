/**
 * Case Study Generator Agent
 * 
 * Responsibilities:
 * - Enhance case study structure
 * - Ensure case studies follow standard template
 * - Add narrative flow
 */

import { AIAnalysis } from './ai-analysis-agent';

export interface CaseStudy {
  title: string;
  background: string;
  incident_flow: string[];
  outcome: string;
  lessons_learned: string[];
}

export class CaseStudyAgent {
  /**
   * Enhance and validate case study structure
   */
  enhanceCaseStudy(
    rawCaseStudy: any,
    incidentTitle: string,
    incidentDescription?: string
  ): CaseStudy {
    // Ensure all required fields exist
    const caseStudy: CaseStudy = {
      title: rawCaseStudy?.title || `Case Study: ${incidentTitle}`,
      background: rawCaseStudy?.background || incidentDescription || 'Background information pending',
      incident_flow: Array.isArray(rawCaseStudy?.incident_flow) 
        ? rawCaseStudy.incident_flow 
        : ['Incident flow analysis pending'],
      outcome: rawCaseStudy?.outcome || 'Outcome analysis pending',
      lessons_learned: Array.isArray(rawCaseStudy?.lessons_learned)
        ? rawCaseStudy.lessons_learned
        : ['Lessons learned analysis pending'],
    };

    // Ensure minimum content
    if (caseStudy.incident_flow.length < 2) {
      caseStudy.incident_flow.push('Additional analysis pending');
    }

    if (caseStudy.lessons_learned.length < 2) {
      caseStudy.lessons_learned.push('Additional lessons pending');
    }

    return caseStudy;
  }

  /**
   * Format case study for display
   */
  formatForDisplay(caseStudy: CaseStudy): {
    narrative: string;
    timeline: Array<{ step: number; event: string }>;
    impact: string;
    takeaways: string[];
  } {
    return {
      narrative: caseStudy.background,
      timeline: caseStudy.incident_flow.map((event, index) => ({
        step: index + 1,
        event,
      })),
      impact: caseStudy.outcome,
      takeaways: caseStudy.lessons_learned,
    };
  }
}
