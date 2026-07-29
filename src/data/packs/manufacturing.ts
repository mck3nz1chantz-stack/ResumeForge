import type { IndustryPack } from '../../types/industryPack'

/** Beachhead — mirrors products/resume-forge/industry-packs/manufacturing.v1.json */
export const manufacturingPack: IndustryPack = {
  id: 'manufacturing',
  displayName: 'Manufacturing / Industrial',
  shortName: 'Manufacturing',
  beachhead: true,
  description:
    'Plant-floor, production, quality, maintenance-adjacent, and team-lead manufacturing roles.',
  managerScanNotes: [
    'Safety culture with numbers (incidents, LTI-free days, audits) — not slogans',
    'Quality metrics: scrap, defects, FTQ, customer escapes',
    'Throughput: output, OEE, changeover, uptime',
    'Scope: crew size, shifts, lines/cells, training responsibility',
    'Named methods and tools (5S, lean, ERP/MES, specific equipment)',
  ],
  metricPrompts: [
    {
      id: 'safety-incidents',
      prompt:
        'Any safety metrics? (recordable rate, days without LTI, near-miss reporting)',
      exampleBullet:
        'Contributed to N days without a recordable injury on [cell/line] through daily safety talks and audit follow-through.',
    },
    {
      id: 'quality-scrap',
      prompt: 'Quality or scrap improvements you can quantify?',
      exampleBullet: 'Reduced scrap/defect rate by X% on [line] by [method].',
    },
    {
      id: 'throughput',
      prompt: 'Throughput, rate, or uptime wins?',
      exampleBullet:
        'Increased line output by X% / cut changeover from A to B minutes using [approach].',
    },
    {
      id: 'crew-scope',
      prompt: 'How many people / shifts / stations did you own or influence?',
      exampleBullet: 'Led crew of N operators across Z shifts on [area].',
    },
    {
      id: 'training',
      prompt: 'Training, cross-training, or standard work ownership?',
      exampleBullet:
        'Trained N new hires on standard work, PPE, and quality criteria for [stations].',
    },
    {
      id: 'ci-kaizen',
      prompt: 'Continuous improvement / kaizen / 5S results?',
      exampleBullet:
        'Led 5S / kaizen that reduced [waste] by [metric] in [area].',
    },
  ],
  keywordBank: [
    'safety',
    'OSHA',
    'lockout/tagout',
    'LOTO',
    'PPE',
    '5S',
    'lean',
    'continuous improvement',
    'kaizen',
    'standard work',
    'quality',
    'FTQ',
    'scrap',
    'OEE',
    'throughput',
    'changeover',
    'SMED',
    'production',
    'assembly',
    'maintenance',
    'TPM',
    'ERP',
    'MES',
    'forklift',
    'team lead',
    'supervisor',
    'cross-training',
    'audit',
    'ISO',
    'root cause',
    'corrective action',
  ],
  bulletSkeletons: [
    'Led crew of {n} on {area}; delivered {target} while maintaining {safety/quality bar}.',
    'Reduced {metric} by {x}% on {line/cell} by implementing {method}.',
    'Owned standard work for {stations}; trained {n} operators to {criteria}.',
    'Drove {audit/type} cadence; closed {n} actions that improved {outcome}.',
    'Improved changeover / setup from {a} to {b} using {approach}.',
  ],
  preferredSkillClusters: [
    'Safety & compliance',
    'Quality systems',
    'Production methods',
    'Tools & systems',
    'Leadership on the floor',
  ],
  skillSuggestions: {
    hard: [
      'Production leadership',
      'Standard work',
      'Quality ownership',
      'Safety compliance',
      'Continuous improvement',
      'Root cause analysis',
      'Cross-training',
    ],
    tools: [
      '5S',
      'lean',
      'MES',
      'ERP',
      'forklift',
      'SPC',
      'OEE',
      'OSHA',
      'Microsoft Excel',
    ],
    soft: [
      'Crew coaching',
      'Clear floor communication',
      'Calm under pressure',
      'Cross-shift coordination',
      'Training new hires',
    ],
  },
  skillCategoryOrder: ['hard', 'tools', 'soft'],
  summaryFormula:
    '[Title / years on floor] + [2–3 domains: safety, quality, throughput/leadership] + [one quantified result].',
  jdPhrases: [
    'first time quality',
    'lockout tagout',
    'lean manufacturing',
    'preventive maintenance',
    'material handling',
  ],
}
