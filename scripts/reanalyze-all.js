/**
 * Bulk Reanalysis Script
 * 
 * Reanalyzes all incidents that don't have AI analysis
 * Processes them sequentially with delays to avoid rate limits
 */

require('dotenv').config({ path: '.env.local' });

async function reanalyzeAll() {
  try {
    const dbModule = await import('../src/lib/db.ts');
    const query = dbModule.query || dbModule.default?.query || dbModule.default;
    const updateIncidentAnalysis = dbModule.updateIncidentAnalysis || dbModule.default?.updateIncidentAnalysis;
    
    const aiModule = await import('../src/agents/ai-analysis-agent.ts');
    const riskModule = await import('../src/agents/risk-severity-agent.ts');
    const caseStudyModule = await import('../src/agents/case-study-agent.ts');
    
    const AIAnalysisAgent = aiModule.AIAnalysisAgent || aiModule.default?.AIAnalysisAgent || aiModule.default;
    const RiskSeverityAgent = riskModule.RiskSeverityAgent || riskModule.default?.RiskSeverityAgent || riskModule.default;
    const CaseStudyAgent = caseStudyModule.CaseStudyAgent || caseStudyModule.default?.CaseStudyAgent || caseStudyModule.default;
    
    const aiAgent = new AIAnalysisAgent();
    const riskAgent = new RiskSeverityAgent();
    const caseStudyAgent = new CaseStudyAgent();
    
    // Get all incidents without proper analysis
    // Check for null, empty, or analysis without summary field
    const result = await query(
      `SELECT id, title, description, content, analysis, status
       FROM incidents 
       WHERE analysis IS NULL 
          OR analysis::text = 'null' 
          OR analysis::text = '{}'
          OR analysis::text = '{"status":"analyzing"}'
          OR analysis::text = '{"status":"failed"}'
          OR (analysis->>'summary') IS NULL
          OR (analysis->>'summary') = ''
          OR status = 'failed'
          OR status = 'pending'
       ORDER BY published_at DESC
       LIMIT 100`
    );
    
    const incidents = result.rows;
    console.log(`\n📊 Found ${incidents.length} incidents needing analysis\n`);
    
    if (incidents.length === 0) {
      console.log('✅ All incidents already have analysis!');
      process.exit(0);
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < incidents.length; i++) {
      const incident = incidents[i];
      console.log(`\n[${i + 1}/${incidents.length}] Analyzing: ${incident.title.substring(0, 60)}...`);
      
      try {
        // Update status to analyzing
        await query(
          `UPDATE incidents SET status = 'analyzing' WHERE id = $1`,
          [incident.id]
        );
        
        // Run AI analysis
        const aiAnalysis = await aiAgent.analyzeIncident(
          incident.title,
          incident.description || incident.content || ''
        );
        
        if (!aiAnalysis) {
          throw new Error('AI analysis returned null');
        }
        
        // Enhance case study
        const enhancedCaseStudy = caseStudyAgent.enhanceCaseStudy(
          aiAnalysis.case_study,
          incident.title,
          incident.description || incident.content || ''
        );
        
        // Assess risk
        const riskAssessment = riskAgent.assessRisk(aiAnalysis);
        
        // Update incident with full analysis
        await updateIncidentAnalysis(incident.id, {
          analysis: {
            ...aiAnalysis,
            case_study: enhancedCaseStudy,
          },
          severity: riskAssessment.severity,
          attack_type: aiAnalysis.attack_type,
          risk_score: riskAssessment.risk_score,
        });
        
        console.log(`   ✅ Success - Severity: ${riskAssessment.severity}, Type: ${aiAnalysis.attack_type}`);
        successCount++;
        
        // Delay between requests to avoid rate limits (3 seconds)
        if (i < incidents.length - 1) {
          console.log('   ⏳ Waiting 3 seconds to avoid rate limits...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
      } catch (error) {
        console.error(`   ❌ Failed: ${error.message}`);
        failCount++;
        
        // Update status to failed
        await query(
          `UPDATE incidents SET status = 'failed' WHERE id = $1`,
          [incident.id]
        );
        
        // Longer delay on error (5 seconds)
        if (i < incidents.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    console.log(`\n\n✅ Reanalysis Complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log(`   Total: ${incidents.length}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Reanalysis failed:', error);
    process.exit(1);
  }
}

reanalyzeAll();
