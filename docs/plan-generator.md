# Plan Generator Spec

This doc captures generator behavior and constraints for the free plan builder.
It is meant to be precise enough to guide implementation and reviews.

## Modalities and generators
Separate generators per modality:
- Running: `10k`, `half`, `marathon`.
- Triathlon: `70.3`, `ironman`.

Each generator should own its own progression rules, workout mix, and long-run caps.

## Selection model (input)
Normalized selection is built in `src/app/plans/preview/selection.js`:
- `goal` (planId): `10k`, `half`, `marathon`, `70.3`, `ironman`.
- `hoursBucketId`: `h_4_6`, `h_6_8`, `h_8_10`, `h_10_12`.
- `structureId`: `s_3key_2easy`, `s_2quality_long`, `s_lowfreq_consistency`.
- `experience`: `new`, `intermediate`, `advanced`.
- `blockWeeks`: `8`, `12`, `16`.
- `shiftMode`: boolean.

## Hours/week buckets
Buckets are shared for all modalities (for now).
Mapping:
- `h_4_6` => 4-6 hours/week
- `h_6_8` => 6-8 hours/week
- `h_8_10` => 8-10 hours/week
- `h_10_12` => 10-12 hours/week

Each generator should aim for total weekly minutes that fit the selected bucket.

## Week structures
Current structures live in `src/data/plans/structures.json`.
Planned changes:
- Ironman needs a 5-7 days/week structure (new entry).
- 70.3 disallows 3-day structure.
- Ironman disallows 3-day and 4-day structures.

Validation should happen in both UI (disable choices) and server (guard in generator).

## Running generator (current behavior)
Reference: `src/lib/planGenerator.js`
- Taper: 10K=1, Half=2, Marathon=3 weeks before race week.
- Long-run caps (minutes): 10K 75-90, Half 95-120, Marathon 120-150
  - "new" runners use lower caps.
- Progression rate is based on experience:
  - new: stepEvery=3
  - intermediate: stepEvery=2
  - advanced: stepEvery=1
- Deload every 4 weeks.

## Long-run caps (desired)
Long-run caps must stay realistic by modality. Example:
- Half marathon should not exceed ~120 minutes.
- Marathon should cap based on experience (avoid excessive long runs for new).
- Triathlon run long runs must be conservative to protect bike volume.

## Weekly volume increase cap
Weekly total minutes should be capped at a safe increase rate.
The canonical rate is defined elsewhere (needs location). Apply it per modality.

## Triathlon generator rules (planned)
Triathlon plans must include swim/bike/run with double days.
Minimum requirements:
- Swims appear on multiple mornings per week (double days).
- Bike sessions dominate total hours; run volume is constrained to protect bike.
- Long bike and long run should not land on consecutive days.
- Brick sessions should appear (bike + short run).

Open items to define:
- Exact swim/bike/run time split by goal + experience.
- Ladder usage for bike and swim (see `src/data/plans/ladders.json`).
- Long-run and long-ride caps by goal + experience.

## Output model (plan)
Each generator returns:
- `id` (unique plan id string)
- `selection` (echo of normalized selection)
- `warnings` (array of strings)
- `generatedAt` (ISO timestamp)
- `weeks` (array)
  - `week` (1-based)
  - `phase` ("build" | "taper" | "race_week")
  - `isDeload` (boolean)
  - `days` (array of scheduled workouts)

## Validation responsibilities
Apply validation in two places:
- UI: disable invalid structures based on goal.
- Server generator: reject invalid combos and emit warnings when needed.
