# UI/UX audit — post-Leverage (2026-07-26)

## Operator feedback addressed

| Request | Fix |
|---------|-----|
| Tools/methods no spaces (“Bill of Materials”) | **Root cause:** live `parseTagInput` + trim on every keystroke killed trailing spaces mid-phrase. **Fix:** `TagInput` chips — type freely with spaces, commit on Add/Enter/comma. |
| Role memories friendlier | Shared `RoleMemories` component: prompt chips, plain-language box, “Add as bullets”. On Jobs + full-history wizard. |
| Clear CTA back to resume build | `BuildContinueBar` under header: shows target + section + **Continue / Back to resume build** + Layouts. |
| Template preview clarity | Gallery: density filter, “Best for”, larger minis, full stack always visible. |
| More formats to stand out | **12** single-column ATS layouts (was 6) — density + section-order variants only (no multi-column). |

## Residual suggestions (not this slice)

1. Template side-by-side compare (2-up) on desktop  
2. Save “favorite layouts” per application  
3. Role memories → also suggest tools chips from free text (opt-in extract)  
4. On mobile, pin BuildContinueBar above live bar  
5. Template CSS “signature” details (rule weight under name) for more visual variety while ATS-safe  

## Taste bar (unchanged)

Operator career tool · paper hero · amber craft · you write language · format via templates · 3-C honest meters.
