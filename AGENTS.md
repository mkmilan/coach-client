# Coach Client Agent Notes

## Scope and intent
This repo powers a Next.js App Router UI for a "free plan" generator. The main logic today is a running-only generator, but the product direction is to split generators by modality:
- Running: 10K, Half Marathon, Marathon.
- Triathlon: 70.3, Ironman (requires swim/bike/run + double days).

## Key files
- `src/lib/planGenerator.js` (current running generator: 10k/half/marathon).
- `src/data/freePlanGoals.js` (goal list and slugs).
- `src/data/freePlanOptions.js` (hours/week, week structures, experience, block lengths).
- `src/data/plans/structures.json` (week patterns).
- `src/data/plans/ladders.json` (run/bike/swim ladders).
- `src/app/plans/preview/selection.js` (query param normalization to selection model).
- `src/app/free-plan/[goal]/Configurator.js` (UI for selection inputs).

## Selection inputs (normalized model)
- `goal` = planId from `FREE_PLAN_GOALS`: `10k`, `half`, `marathon`, `70.3`, `ironman`.
- `hoursBucketId` = `h_4_6`, `h_6_8`, `h_8_10`, `h_10_12`.
- `structureId` = `s_3key_2easy`, `s_2quality_long`, `s_lowfreq_consistency`.
- `experience` = `new`, `intermediate`, `advanced`.
- `blockWeeks` = `8`, `12`, `16`.
- `shiftMode` = boolean; triggers `applyShiftReflow`.

## Product guardrails (current + planned)
- Running generator supports 10K/Half/Marathon only.
- Triathlon generators will be separate per modality and must include double days.
- Structure rules:
  - 70.3: disallow 3-day structure.
  - Ironman: disallow 3-day and 4-day structures.
  - Ironman should support a 5–7 days/week structure (new structure to add).
- Long-run caps should be modality specific (ex: no 2.5h long run for half marathon).
- Weekly volume increases must be capped to a sensible rate (rate is defined elsewhere; locate source).

## Running generator behavior (today)
- Taper length: 10K=1, Half=2, Marathon=3 weeks before race week.
- Long-run caps: 10K 75-90, Half 95-120, Marathon 120-150 (lower for new).
- Progression pace is tied to `experience`.
- `shiftMode` reflows back-to-back key sessions.

## Notes for future work
- Split generator entry points by modality (run vs tri).
- Add triathlon-specific structures, ladders usage, and time allocation logic.
- Add validation in selection layer to enforce structure restrictions.

## TODOs (need confirmation)
- Where is the canonical weekly increase cap stored? (user indicated it exists)
- Triathlon hour splits by modality + experience.
