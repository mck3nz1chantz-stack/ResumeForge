import type { IndustryPack } from '../../types/industryPack'

/** Corporate / professional stub pack */
export const corporatePack: IndustryPack = {
  id: 'corporate',
  displayName: 'Corporate / Professional',
  shortName: 'Corporate',
  description:
    'Office, operations coordination, project support, and professional roles — stakeholders, process, ownership.',
  managerScanNotes: [
    'Stakeholders you supported and outcomes (not just task lists)',
    'Process ownership: documentation, SOPs, handoffs, SLAs',
    'Tools: Excel, ERP/CRM, ticketing, reporting dashboards',
    'Cross-functional influence and clear communication',
    'Quantified volume or cycle-time improvements when real',
  ],
  metricPrompts: [
    {
      id: 'corp-volume',
      prompt: 'Volume or throughput of work you owned? (tickets, orders, reports)',
      exampleBullet:
        'Processed / closed N [tickets/orders/reports] per [week] with [accuracy/SLA] target.',
    },
    {
      id: 'corp-cycle',
      prompt: 'Cycle time or handoff improvements?',
      exampleBullet:
        'Cut [process] cycle time from A to B by standardizing [handoff/checklist].',
    },
    {
      id: 'corp-stakeholder',
      prompt: 'Cross-team or stakeholder coordination wins?',
      exampleBullet:
        'Coordinated with [teams] to deliver [project/outcome] on [timeline].',
    },
    {
      id: 'corp-process',
      prompt: 'Process, SOP, or documentation ownership?',
      exampleBullet:
        'Owned SOP / playbook for [process]; trained N peers and reduced [errors/escalations].',
    },
    {
      id: 'corp-tools',
      prompt: 'Named systems you ran day-to-day?',
      exampleBullet:
        'Ran [ERP/CRM/Excel model] for [report/forecast]; delivered weekly [visibility] to [audience].',
    },
  ],
  keywordBank: [
    'stakeholder',
    'cross-functional',
    'process improvement',
    'SOP',
    'project coordination',
    'Excel',
    'ERP',
    'CRM',
    'reporting',
    'dashboard',
    'SLA',
    'documentation',
    'operations',
    'compliance',
    'budget',
    'forecast',
    'presentation',
    'meeting facilitation',
    'change management',
    'vendor',
    'audit',
  ],
  bulletSkeletons: [
    'Partnered with {teams} to deliver {outcome} by {date/milestone}.',
    'Owned {process/report}; improved {metric} by {x}% through {method}.',
    'Built / maintained {tool/dashboard} used by {audience} for {decision}.',
    'Documented SOP for {process}; reduced {errors/escalations} by {result}.',
    'Coordinated {project} across {n} stakeholders with {constraint}.',
  ],
  preferredSkillClusters: [
    'Process & operations',
    'Analysis & reporting',
    'Systems & tools',
    'Stakeholder skills',
  ],
  skillSuggestions: {
    hard: [
      'Process improvement',
      'Project coordination',
      'Reporting & analysis',
      'SOP ownership',
      'Vendor coordination',
      'Compliance tracking',
    ],
    tools: [
      'Microsoft Excel',
      'ERP',
      'CRM',
      'PowerPoint',
      'SharePoint',
      'Ticketing systems',
    ],
    soft: [
      'Stakeholder communication',
      'Meeting facilitation',
      'Cross-functional partnership',
      'Clear written updates',
      'Prioritization under deadline',
    ],
  },
  skillCategoryOrder: ['hard', 'soft', 'tools'],
  summaryFormula:
    '[Role / years] + [2 domains: process, stakeholders, systems] + [one real outcome].',
  jdPhrases: [
    'cross functional',
    'process improvement',
    'change management',
    'business operations',
  ],
}
