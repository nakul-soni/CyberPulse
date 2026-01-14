"use strict";
/**
 * Case Study Generator Agent
 *
 * Responsibilities:
 * - Enhance case study structure
 * - Ensure case studies follow standard template
 * - Add narrative flow
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseStudyAgent = void 0;
class CaseStudyAgent {
    /**
     * Enhance and validate case study structure
     */
    enhanceCaseStudy(rawCaseStudy, incidentTitle, incidentDescription) {
        // Support variations in field names
        const raw = rawCaseStudy || {};
        const caseStudy = {
            title: raw.title || `Case Study: ${incidentTitle}`,
            background: raw.background || incidentDescription || 'Background information pending',
            attack_vector: raw.attack_vector || raw.attackVector || 'Technical analysis pending',
            incident_flow: Array.isArray(raw.incident_flow || raw.incidentFlow)
                ? (raw.incident_flow || raw.incidentFlow)
                : ['Incident flow analysis pending'],
            outcome: raw.outcome || 'Outcome analysis pending',
            lessons_learned: Array.isArray(raw.lessons_learned || raw.lessonsLearned)
                ? (raw.lessons_learned || raw.lessonsLearned)
                : ['Lessons learned analysis pending'],
            recommendations: Array.isArray(raw.recommendations || raw.recommendation)
                ? (raw.recommendations || raw.recommendation)
                : ['Prevention recommendations pending'],
        };
        // Ensure minimum content
        if (caseStudy.incident_flow.length < 2) {
            caseStudy.incident_flow.push('Additional analysis pending');
        }
        if (caseStudy.lessons_learned.length < 2) {
            caseStudy.lessons_learned.push('Additional lessons pending');
        }
        if (caseStudy.recommendations.length < 2) {
            caseStudy.recommendations.push('Additional recommendations pending');
        }
        return caseStudy;
    }
    /**
     * Format case study for display
     */
    formatForDisplay(caseStudy) {
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
exports.CaseStudyAgent = CaseStudyAgent;
