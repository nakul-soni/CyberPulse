const { Pool } = require('pg');
const crypto = require('crypto');

// Use environment variables for connection
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || '12345678'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'cyberpulse'}`;

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
});

const famousCases = [
  {
    title: 'Stuxnet Worm',
    description: 'A sophisticated malicious computer worm that targeted SCADA systems and caused physical damage to Iran\'s nuclear program.',
    content: 'Stuxnet is a malicious computer worm first uncovered in 2010. It was specifically designed to target programmable logic controllers (PLCs), which allow the automation of electromechanical processes of the type used to control machinery and industrial processes including centrifuges for separating nuclear material.',
    url: 'https://en.wikipedia.org/wiki/Stuxnet',
    source: 'Cyber Intelligence Historical Archives',
    published_at: '2010-06-01T00:00:00Z',
    severity: 'High',
    attack_type: 'Worm / APT',
    risk_score: 98,
    region: 'Global / Middle East',
    analysis: {
      summary: 'State-sponsored cyber weapon targeting industrial control systems.',
      threat_actor: 'Attributed to US and Israel (Operation Olympic Games)',
      vulnerabilities: ['Zero-day Windows vulnerabilities', 'PLC hardcoded credentials'],
      impact: 'Physical destruction of nuclear centrifuges',
      mitigation_steps: ['Air-gapping critical systems', 'Hardware root of trust', 'Strict USB policies'],
      case_study: {
        title: 'Case Study: Stuxnet',
        background: 'Targeting the Natanz uranium enrichment facility.',
        attack_vector: 'USB flash drive (infected air-gapped network)',
        incident_flow: ['Initial infection via USB', 'Lateral movement across Windows network', 'Targeting Siemens Step7 software', 'Sabotaging PLC frequencies'],
        outcome: 'Delayed Iran\'s nuclear program by years.',
        lessons_learned: ['Air-gaps are not impenetrable', 'Supply chain security is vital'],
        recommendations: ['Continuous monitoring of industrial traffic', 'PLC firmware validation']
      }
    }
  },
  {
    title: 'WannaCry Ransomware Attack',
    description: 'A global ransomware attack that targeted computers running the Microsoft Windows operating system by encrypting data and demanding ransom payments in Bitcoin.',
    content: 'WannaCry is a ransomware worm that spread rapidly across computer networks in May 2017. It used the EternalBlue exploit, which was allegedly developed by the US National Security Agency (NSA) and leaked by the Shadow Brokers group.',
    url: 'https://en.wikipedia.org/wiki/WannaCry_ransomware_attack',
    source: 'Global Threat Intelligence',
    published_at: '2017-05-12T00:00:00Z',
    severity: 'High',
    attack_type: 'Ransomware',
    risk_score: 95,
    region: 'Global',
    analysis: {
      summary: 'Self-propagating ransomware using leaked NSA exploits.',
      threat_actor: 'Lazarus Group (North Korea)',
      vulnerabilities: ['MS17-010 (EternalBlue)'],
      impact: 'Over 200,000 computers infected; NHS UK services disrupted.',
      mitigation_steps: ['Patching legacy systems', 'SMBv1 disablement', 'Network segmentation'],
      case_study: {
        title: 'Case Study: WannaCry',
        background: 'Massive global ransomware outbreak.',
        attack_vector: 'EternalBlue SMB exploit',
        incident_flow: ['Initial propagation via SMB', 'Encryption of user files', 'Bitcoin ransom demand', 'Kill-switch discovery by Marcus Hutchins'],
        outcome: 'Billions in damages worldwide.',
        lessons_learned: ['Importance of rapid patching', 'Risks of end-of-life OS'],
        recommendations: ['Automated patch management', 'Endpoint detection and response (EDR)']
      }
    }
  },
  {
    title: 'SolarWinds Supply Chain Attack',
    description: 'A major cyberattack that compromised the software supply chain of SolarWinds, affecting thousands of organizations including the US government.',
    content: 'The SolarWinds attack was a highly sophisticated supply chain compromise. Attackers injected malicious code (SUNBURST) into the Orion software updates, which were then distributed to approximately 18,000 customers.',
    url: 'https://en.wikipedia.org/wiki/2020_United_States_federal_government_data_breach',
    source: 'FireEye / Microsoft Intelligence',
    published_at: '2020-12-13T00:00:00Z',
    severity: 'High',
    attack_type: 'Supply Chain / APT',
    risk_score: 99,
    region: 'North America / Global',
    analysis: {
      summary: 'Stealthy supply chain compromise targeting government and tech giants.',
      threat_actor: 'APT29 (Cozy Bear / SVR Russia)',
      vulnerabilities: ['Compromised build pipeline'],
      impact: 'Deep access to US Treasury, Commerce, and State Departments.',
      mitigation_steps: ['Software Bill of Materials (SBOM)', 'Build pipeline integrity checks'],
      case_study: {
        title: 'Case Study: SolarWinds',
        background: 'Compromise of the Orion platform build system.',
        attack_vector: 'Malicious update injection (SUNBURST)',
        incident_flow: ['Compromise of SolarWinds internal network', 'Insertion of backdoor into source code', 'Signed update distribution', 'Post-exploitation of high-value targets'],
        outcome: 'Unprecedented access to Western government intelligence.',
        lessons_learned: ['Trust in signed software is not absolute', 'Build systems are high-value targets'],
        recommendations: ['Multi-factor build verification', 'Zero Trust Architecture']
      }
    }
  },
  {
    title: 'Colonial Pipeline Ransomware Attack',
    description: 'A critical ransomware attack on the largest fuel pipeline in the United States, causing widespread fuel shortages and a state of emergency.',
    content: 'In May 2021, the Colonial Pipeline, which provides 45% of the fuel to the US East Coast, was compromised by the DarkSide ransomware gang. The attack targeted the company\'s billing network, but the pipeline was shut down for six days as a precaution, leading to panic buying and fuel shortages. The company paid a $4.4 million ransom to regain access to its data.',
    url: 'https://en.wikipedia.org/wiki/Colonial_Pipeline_ransomware_attack',
    source: 'FBI / CISA Intelligence Report',
    published_at: '2021-05-07T00:00:00Z',
    severity: 'High',
    attack_type: 'Ransomware',
    risk_score: 97,
    region: 'North America / USA',
    analysis: {
      summary: 'High-impact ransomware attack on critical infrastructure.',
      threat_actor: 'DarkSide (Ransomware-as-a-Service group)',
      vulnerabilities: ['Compromised VPN credentials (single-factor authentication)'],
      impact: 'Operational shutdown of critical energy infrastructure, regional fuel shortages, $4.4M ransom paid.',
      mitigation_steps: ['Multi-factor authentication (MFA)', 'Network segmentation between IT and OT', 'Enhanced credential monitoring'],
      case_study: {
        title: 'Case Study: Colonial Pipeline',
        background: 'Ransomware attack on the largest refined products pipeline in the US.',
        attack_vector: 'Credential theft (Leaked VPN password)',
        incident_flow: ['Access via legacy VPN profile', 'Encryption of IT systems (Billing/Accounting)', 'Precautionary shutdown of OT (Pipeline operations)', 'Ransom payment and recovery'],
        outcome: 'National security implications and significant policy shifts in infrastructure cybersecurity.',
        lessons_learned: ['MFA is non-negotiable for remote access', 'IT/OT convergence requires strict isolation', 'Ransomware affects more than just data'],
        recommendations: ['Zero-trust remote access', 'Regular tabletop exercises for incident response']
      }
    }
  }
];

async function seed() {
  try {
    console.log(`Using connection: ${connectionString.split('@')[1]}`);
    for (const incident of famousCases) {
      const contentHash = crypto
        .createHash('md5')
        .update(incident.title + incident.description)
        .digest('hex');

      const check = await pool.query('SELECT id FROM incidents WHERE content_hash = $1 OR url = $2', [contentHash, incident.url]);
      
      if (check.rowCount === 0) {
        console.log(`Seeding: ${incident.title}`);
        const res = await pool.query(
          `INSERT INTO incidents (title, description, content, url, source, published_at, content_hash, region, status, severity, attack_type, risk_score, analysis)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'analyzed', $9, $10, $11, $12)`,
          [
            incident.title,
            incident.description,
            incident.content,
            incident.url,
            incident.source,
            new Date(incident.published_at),
            contentHash,
            incident.region,
            incident.severity,
            incident.attack_type,
            incident.risk_score,
            JSON.stringify(incident.analysis)
          ]
        );
      } else {
        console.log(`Skipping (already exists): ${incident.title}`);
      }
    }
    console.log('Seeding completed successfully');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await pool.end();
  }
}

seed();
