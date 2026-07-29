import type { IndustryPack } from '../../types/industryPack'

/** Customer service / support stub pack */
export const customerServicePack: IndustryPack = {
  id: 'customer-service',
  displayName: 'Customer Service / Support',
  shortName: 'Customer service',
  description:
    'Frontline support, call center, retail service, and account care — volume, CSAT, de-escalation, CRM.',
  managerScanNotes: [
    'Volume: calls, chats, tickets handled (with quality bar)',
    'CSAT / NPS / quality scores when you have real numbers',
    'De-escalation and retention of frustrated customers',
    'CRM and tools named (Zendesk, Salesforce, phone system…)',
    'Training, mentoring, or queue ownership scope',
  ],
  metricPrompts: [
    {
      id: 'cs-volume',
      prompt: 'Contact volume you handled? (calls, chats, tickets)',
      exampleBullet:
        'Handled N [calls/chats/tickets] per [day/shift] while meeting [quality/AHT] standards.',
    },
    {
      id: 'cs-csat',
      prompt: 'CSAT, quality, or resolution metrics?',
      exampleBullet:
        'Maintained CSAT / quality score of X% over [period] on [channel].',
    },
    {
      id: 'cs-deescalation',
      prompt: 'De-escalation or save stories you can describe honestly?',
      exampleBullet:
        'De-escalated complex issues by [approach]; retained [customer type] without supervisor escalate when appropriate.',
    },
    {
      id: 'cs-crm',
      prompt: 'CRM or knowledge-base tools you used daily?',
      exampleBullet:
        'Documented cases in [CRM]; used [KB] to resolve first-contact issues on [product].',
    },
    {
      id: 'cs-train',
      prompt: 'Training, mentoring, or queue lead work?',
      exampleBullet:
        'Trained N new agents on [queue/product]; coached on [skill] using real call examples.',
    },
  ],
  keywordBank: [
    'customer service',
    'CSAT',
    'NPS',
    'first contact resolution',
    'FCR',
    'de-escalation',
    'CRM',
    'Zendesk',
    'Salesforce',
    'ticketing',
    'call center',
    'chat support',
    'AHT',
    'SLA',
    'retention',
    'empathy',
    'multichannel',
    'knowledge base',
    'queue',
    'escalation',
  ],
  bulletSkeletons: [
    'Handled {n} {channel} contacts per {shift} at {quality bar}.',
    'Resolved {issue type} using {CRM/KB}; protected {CSAT/retention} goals.',
    'De-escalated {situation} by {approach} without inventing policy exceptions.',
    'Trained {n} peers on {product/queue}; improved {onboarding metric}.',
    'Owned {queue/channel} coverage for {hours/period} with {SLA}.',
  ],
  preferredSkillClusters: [
    'Service quality',
    'Systems & CRM',
    'People skills',
    'Operations',
  ],
  skillSuggestions: {
    hard: [
      'First contact resolution',
      'De-escalation',
      'Order / account support',
      'Policy navigation',
      'Queue ownership',
      'Quality monitoring',
    ],
    tools: [
      'CRM',
      'Zendesk',
      'Salesforce',
      'Phone system',
      'Chat platform',
      'Knowledge base',
      'Microsoft Excel',
    ],
    soft: [
      'Empathy under pressure',
      'Clear verbal communication',
      'Active listening',
      'Patience with frustrated customers',
      'Team backup mindset',
    ],
  },
  skillCategoryOrder: ['soft', 'hard', 'tools'],
  summaryFormula:
    '[Role / years in service] + [channels + quality focus] + [one real volume or CSAT result].',
  jdPhrases: [
    'first contact resolution',
    'customer satisfaction',
    'call center',
    'help desk',
  ],
}
