import type { Skills } from '../types/profile'
import {
  SKILL_CATEGORIES,
  countMasterSkills,
  isAllSkillsSelected,
  isSkillSelected,
  masterSkillKeys,
  selectAllSkills,
  selectNoSkills,
  selectSkillCategoryOnly,
  selectedSkillKeys,
  skillKey,
  toggleSkillSelection,
  type SkillCategory,
} from '../lib/featuredSkills'

type Props = {
  skills: Skills
  featuredSkillKeys: string[]
  onChange: (featuredSkillKeys: string[]) => void
  /** Jump to Skills bank */
  onOpenSkills?: () => void
  compact?: boolean
}

/**
 * Master skills bank → per-build checkboxes (mirrors VersionJobPicker).
 */
export function VersionSkillPicker({
  skills,
  featuredSkillKeys,
  onChange,
  onOpenSkills,
  compact = false,
}: Props) {
  const allKeys = masterSkillKeys(skills)
  const selected = selectedSkillKeys(featuredSkillKeys, allKeys)
  const allOn = isAllSkillsSelected(featuredSkillKeys, allKeys)
  const n = selected.length
  const total = countMasterSkills(skills)

  return (
    <div
      className={
        compact
          ? 'space-y-2'
          : 'rounded-xl border border-teal-900/40 bg-teal-950/15 p-3 sm:p-4'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3
            className={
              compact
                ? 'text-sm font-semibold text-slate-100'
                : 'text-sm font-semibold text-teal-100'
            }
          >
            Skills on this resume
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Master bank holds every skill. Check only what belongs on{' '}
            <strong className="font-medium text-slate-400">this resume</strong>
            {total > 0 ? (
              <>
                {' '}
                ·{' '}
                <span className="text-slate-300">
                  {n} of {total} selected
                </span>
              </>
            ) : null}
          </p>
        </div>
        {onOpenSkills && (
          <button
            type="button"
            className="rf-btn min-h-9 shrink-0 text-xs"
            onClick={onOpenSkills}
          >
            + Edit bank
          </button>
        )}
      </div>

      {total === 0 ? (
        <p className="text-sm text-slate-500">
          No skills in the master bank yet. Add them under Skills — they stay
          saved even when unchecked on a build.
          {onOpenSkills ? (
            <>
              {' '}
              <button
                type="button"
                className="font-medium text-teal-300/90 underline decoration-teal-700/50 underline-offset-2"
                onClick={onOpenSkills}
              >
                Open Skills
              </button>
            </>
          ) : null}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              className={`rf-btn min-h-9 text-xs ${allOn ? 'rf-btn-primary' : ''}`}
              onClick={() => onChange(selectAllSkills())}
            >
              All skills
            </button>
            {SKILL_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className="rf-btn min-h-9 text-xs"
                title={`Only ${c.label}`}
                onClick={() => onChange(selectSkillCategoryOnly(skills, c.id))}
              >
                {c.label.split(' ')[0]} only
              </button>
            ))}
            <button
              type="button"
              className="rf-btn min-h-9 text-xs"
              onClick={() => onChange(selectNoSkills())}
            >
              None
            </button>
          </div>

          <div className="mt-2 space-y-3">
            {SKILL_CATEGORIES.map((cat) => {
              const items = skills[cat.id].map((s) => s.trim()).filter(Boolean)
              if (items.length === 0) return null
              return (
                <div key={cat.id}>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {cat.label}
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {items.map((skill) => {
                      const key = skillKey(cat.id as SkillCategory, skill)
                      const checked = isSkillSelected(
                        key,
                        featuredSkillKeys,
                        allKeys,
                      )
                      return (
                        <li key={key}>
                          <label
                            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                              checked
                                ? 'border-teal-800/50 bg-teal-950/40 text-slate-100'
                                : 'border-slate-800 bg-slate-950/40 text-slate-500'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="size-3.5 shrink-0 rounded border-slate-600 bg-slate-900 text-teal-500"
                              checked={checked}
                              onChange={() =>
                                onChange(
                                  toggleSkillSelection(
                                    key,
                                    featuredSkillKeys,
                                    allKeys,
                                  ),
                                )
                              }
                            />
                            <span className="max-w-[14rem] truncate">{skill}</span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>

          {n === 0 && (
            <p className="text-xs text-amber-300/90">
              No skills selected — Skills section will be empty on this resume
              until you check some.
            </p>
          )}
          {!allOn && n > 0 && (
            <p className="text-[11px] text-slate-500">
              Unchecked skills stay in your master bank for other builds.
            </p>
          )}
        </>
      )}
    </div>
  )
}
