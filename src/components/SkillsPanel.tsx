import type { Skills } from '../types/profile'
import type { IndustryPack } from '../types/industryPack'
import { scaffoldFor } from '../data/expertScaffolds'
import { getPack } from '../data/packs'
import { SectionCoach } from './SectionCoach'
import { SectionGuide } from './SectionGuide'
import { SkillChipList } from './SkillChipList'

type Props = {
  skills: Skills
  onChange: (skills: Skills) => void
  /** Active industry pack drives suggestions */
  packId?: string
}

export function SkillsPanel({ skills, onChange, packId }: Props) {
  const pack: IndustryPack = getPack(packId)
  const coach = scaffoldFor('skills')
  const empty =
    skills.hard.length + skills.tools.length + skills.soft.length === 0

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-50">
            Step 4 · Skills
          </h2>
          <p className="text-sm text-slate-400">
            Master skills bank (often above experience on the paper). Each build
            checkboxes which print. Suggestions follow the{' '}
            <strong className="font-medium text-slate-200">{pack.shortName}</strong>{' '}
            pack — keep naming consistent for Consistency.
          </p>
        </div>
        <SectionGuide guideId="skills" />
      </header>

      {coach && <SectionCoach scaffold={coach} defaultOpen={empty} />}

      <div className="rf-card border-slate-800 py-2">
        <p className="text-xs text-slate-500">
          Clusters: {pack.preferredSkillClusters.join(' · ')}
        </p>
      </div>

      <SkillChipList
        label="Hard / domain skills"
        hint="What you can do in the role (methods, ownership areas)."
        items={skills.hard}
        onChange={(hard) => onChange({ ...skills, hard })}
        placeholder="e.g. domain skill"
        suggestions={pack.skillSuggestions.hard}
      />

      <SkillChipList
        label="Tools & systems"
        hint="Named tools, software, methods."
        items={skills.tools}
        onChange={(tools) => onChange({ ...skills, tools })}
        placeholder="e.g. systems you use"
        suggestions={pack.skillSuggestions.tools}
      />

      <SkillChipList
        label="Soft / leadership"
        hint="How you lead and work with people — back these up in job bullets."
        items={skills.soft}
        onChange={(soft) => onChange({ ...skills, soft })}
        placeholder="e.g. coaching"
        suggestions={pack.skillSuggestions.soft}
      />
    </div>
  )
}
