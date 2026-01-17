import structuresData from "@/data/plans/structures.json";
import ladders from "@/data/plans/ladders.json";
import goalProfilesData from "@/data/plans/goalProfiles.json";
import runProfilesData from "@/data/plans/runProfiles.json";

const RUN_GOALS = ["10k", "half", "marathon"];

function clamp(n, min, max) {
	return Math.max(min, Math.min(max, n));
}

function pickFrom(arr, idx) {
	const i = clamp(idx, 0, arr.length - 1);
	return arr[i];
}

function bucketIndex(bucketId) {
	const order = ["h_4_6", "h_6_8", "h_8_10", "h_10_12"];
	return order.indexOf(bucketId);
}

function progressionForExperience(experience) {
	// Slower progression for new runners
	if (experience === "new") return { start: 0, stepEvery: 3, deloadEvery: 4 };
	if (experience === "advanced") return { start: 1, stepEvery: 1, deloadEvery: 4 };
	return { start: 0, stepEvery: 2, deloadEvery: 4 }; // intermediate
}

function getStructure(structureId) {
	const s = (structuresData.structures || []).find((x) => x.id === structureId);
	if (!s) throw new Error("Invalid week structure.");
	return s;
}

function getLongRunConfig(goal) {
	return runProfilesData?.profiles?.[goal]?.longRun || null;
}

function getGoalLongRunCap(goal, experience) {
	const cfg = getLongRunConfig(goal);
	if (cfg?.capByExperience?.[experience] != null) {
		return cfg.capByExperience[experience];
	}
	if (goal === "10k") return experience === "new" ? 75 : 90;
	if (goal === "half") return experience === "new" ? 95 : 120;
	if (goal === "marathon") return experience === "new" ? 120 : 150;
	return 120;
}

function baseLongRunStart(goal, experience, hoursBucketId) {
	const cfg = getLongRunConfig(goal);
	const base =
		cfg?.startByBucket?.[hoursBucketId] ??
		(hoursBucketId === "h_4_6" ? 55 : hoursBucketId === "h_6_8" ? 70 : hoursBucketId === "h_8_10" ? 80 : 90);
	const adjust = cfg?.startAdjustByExperience?.[experience] ?? 0;

	return clamp(base + adjust, 40, 110);
}

function taperFactor(goal, weeksFromRaceWeek) {
	// weeksFromRaceWeek: 0 = race week, 1 = 1 week before race week, etc.
	if (goal === "10k") {
		if (weeksFromRaceWeek === 1) return 0.8;
		if (weeksFromRaceWeek === 0) return 0.6;
		return 1;
	}

	if (goal === "half") {
		if (weeksFromRaceWeek === 2) return 0.85;
		if (weeksFromRaceWeek === 1) return 0.75;
		if (weeksFromRaceWeek === 0) return 0.6;
		return 1;
	}

	// marathon
	if (weeksFromRaceWeek === 3) return 0.85;
	if (weeksFromRaceWeek === 2) return 0.75;
	if (weeksFromRaceWeek === 1) return 0.65;
	if (weeksFromRaceWeek === 0) return 0.55;
	return 1;
}

function isFiveSixDaysStructure(structureId) {
	return structureId === "s_lowfreq_consistency";
}

function pickPhaseQuality(goal, experience, phase, weekIndex) {
	const profile = runProfilesData?.profiles?.[goal];
	const phaseKey = phase === "race_week" ? "taper" : phase;
	const qualitySet =
		experience === "new"
			? profile?.qualityByPhaseNew?.[phaseKey]
			: profile?.qualityByPhase?.[phaseKey];
	if (!qualitySet) return { q1: "threshold", q2: "speed" };

	const q2 = Array.isArray(qualitySet.q2)
		? qualitySet.q2[weekIndex % qualitySet.q2.length]
		: qualitySet.q2;

	return { q1: qualitySet.q1, q2 };
}

function buildRaceWorkout(goal) {
	// Keep it simple and clear: Sunday is race day
	const label = goal === "10k" ? "10K" : goal === "half" ? "Half Marathon" : "Marathon";
	return {
		sport: "run",
		title: `Race day — ${label}`,
		minutes: null,
		intensity: "Race effort",
		notes: "Warm-up + race + cool-down. Execute pacing. Fuel/hydrate if needed.",
	};
}

function buildRunWorkout(slot, goal, weekIndex, experience, hoursBucketId, factor, structureId, phase, earlyBaseNew, isDeload) {
	const prog = progressionForExperience(experience);
	const step = prog.start + Math.floor(weekIndex / prog.stepEvery);

	const fiveSix = isFiveSixDaysStructure(structureId);

	// EASY runs get shorter for new runners, especially on 5–6 days/week
	if (slot === "easy_1" || slot === "easy_2") {
		const base = pickFrom(ladders.run.easyMinutes, step);
		const saferBase = experience === "new" ? Math.min(base, fiveSix ? 40 : 50) : base;

		return {
			sport: "run",
			title: "Easy run",
			minutes: Math.max(20, Math.round(saferBase * factor)),
			intensity: "RPE 3–4",
			notes: "Conversational. Keep it relaxed.",
		};
	}

	if (slot === "easy_optional") {
		const base = pickFrom(ladders.run.easyMinutes, Math.max(0, step - 1));
		const saferBase = experience === "new" ? Math.min(base, 35) : base;

		return {
			sport: "run",
			title: "Optional easy run",
			minutes: Math.max(20, Math.round(saferBase * 0.9 * factor)),
			intensity: "RPE 2–3",
			notes: "Optional. Skip if tired or any niggles show up.",
			optional: true,
		};
	}

	if (slot === "long_run") {
		const cap = getGoalLongRunCap(goal, experience);
		const start = baseLongRunStart(goal, experience, hoursBucketId);
		const cfg = getLongRunConfig(goal);
		const weeklyIncrease = cfg?.weeklyIncrease ?? 5;
		const mpSegment = getMarathonMPSegment(goal, experience, hoursBucketId, weekIndex, phase, isDeload);

		// Progression: +5 min most weeks, but cap by goal + experience.
		const raw = start + weekIndex * weeklyIncrease;
		const minutes = clamp(raw, start, cap);

		return {
			sport: "run",
			title: mpSegment ? "Long run + marathon pace" : "Long run",
			minutes: Math.max(30, Math.round(minutes * factor)),
			intensity: "RPE 4–5",
			notes: mpSegment
				? `Steady endurance with ${mpSegment} at marathon pace. 3' easy between blocks.`
				: goal === "marathon"
					? "Steady endurance. Practice fueling."
					: "Steady endurance. No hero pace.",
		};
	}

	if (slot === "quality_1" || slot === "quality_2") {
		if (earlyBaseNew && phase !== "race_week") {
			if (slot === "quality_1") {
				return {
					sport: "run",
					title: "Easy run",
					minutes: Math.max(20, Math.round(35 * factor)),
					intensity: "RPE 3–4",
					notes: "Early base focus. Keep it gentle.",
				};
			}
			return {
				sport: "run",
				title: "Easy + strides",
				minutes: Math.max(20, Math.round(30 * factor)),
				intensity: "RPE 3–4 + 4×20s fast",
				notes: "Early base focus. Keep it light.",
			};
		}

		if (phase === "race_week") {
			if (slot === "quality_1") {
				return {
					sport: "run",
					title: "Tune-up run",
					minutes: Math.max(20, Math.round(35 * factor)),
					intensity: "RPE 6–7",
					notes: "Short pickups with full recovery. Leave feeling sharp.",
				};
			}
			return {
				sport: "run",
				title: "Easy + strides",
				minutes: Math.max(20, Math.round(30 * factor)),
				intensity: "RPE 3–4 + 4×20s fast",
				notes: "Keep it light. No fatigue carryover.",
			};
		}

		const fam = pickPhaseQuality(goal, experience, phase, weekIndex);
		const family = slot === "quality_1" ? fam.q1 : fam.q2;

		// quality_2 might become easy for NEW marathon
		if (family === "easy") {
			return {
				sport: "run",
				title: "Easy run",
				minutes: Math.max(20, Math.round(40 * factor)),
				intensity: "RPE 3–4",
				notes: "Keep it easy. The goal is consistency.",
			};
		}

		if (family === "threshold") {
			const s = pickFrom(ladders.run.thresholdSteps, step);
			// New runner guard: keep threshold conservative (avoid long totals early)
			const baseMinutes = experience === "new" ? 50 : 60;

			return {
				sport: "run",
				title: `Threshold ${s.label}`,
				minutes: Math.max(35, Math.round(baseMinutes * factor)),
				intensity: "RPE 7 (controlled)",
				details: { sets: s.sets, workMin: s.workMin, restMin: s.restMin },
				notes: "Smooth reps. Stop while form stays good.",
			};
		}

		if (family === "threshold_marathon") {
			const s = pickFrom(ladders.run.thresholdSteps, step + 1);
			return {
				sport: "run",
				title: `Marathon-threshold ${s.label}`,
				minutes: Math.max(40, Math.round(70 * factor)),
				intensity: "RPE 6–7",
				details: { sets: s.sets, workMin: s.workMin, restMin: s.restMin },
				notes: "Strong-steady. Avoid sharp surges.",
			};
		}

		if (family === "vo2") {
			// your rule is already satisfied: ladder begins at 3×3
			const s = pickFrom(ladders.run.vo2Steps, step);
			return {
				sport: "run",
				title: `VO2 ${s.label}`,
				minutes: Math.max(35, Math.round(60 * factor)),
				intensity: "RPE 8–9",
				details: { reps: s.reps, workMin: s.workMin, restMin: s.restMin },
				notes: "Hard but repeatable. Keep quality consistent.",
			};
		}

		if (family === "speed") {
			// Strides are safer than extra VO2 for NEW runners
			return {
				sport: "run",
				title: "Easy + strides",
				minutes: Math.max(25, Math.round(45 * factor)),
				intensity: "RPE 3–4 + 6×20s fast",
				notes: "Full recovery between strides. Snappy, not exhausting.",
			};
		}

		// steady marathon
		return {
			sport: "run",
			title: "Steady aerobic",
			minutes: Math.max(30, Math.round(55 * factor)),
			intensity: "RPE 5–6",
			notes: "Progressive steady. Finish slightly faster.",
		};
	}

	return {
		sport: "run",
		title: "Easy run",
		minutes: Math.max(20, Math.round(40 * factor)),
		intensity: "RPE 3–4",
		notes: "Relaxed.",
	};
}

function applyShiftReflow(days) {
	// MVP: avoid back-to-back key sessions
	const out = [...days];
	for (let i = 1; i < out.length; i++) {
		if (out[i].isKey && out[i - 1].isKey) {
			const j = out.findIndex((d, idx) => idx > i && !d.isKey);
			if (j !== -1) {
				const tmp = out[i];
				out[i] = out[j];
				out[j] = tmp;
			}
		}
	}
	return out;
}

function applyDeloadAdjustments(days) {
	return days.map((d) => {
		if (d.workout.minutes == null) return d;
		let factor = 0.75;
		if (d.slot === "quality_1") factor = 0.7;
		if (d.slot === "quality_2") factor = 0.6;
		if (d.slot === "long_run") factor = 0.7;
		if (d.slot === "easy_optional") factor = 0.65;

		return {
			...d,
			workout: {
				...d.workout,
				minutes: Math.max(20, Math.round(d.workout.minutes * factor)),
				notes: `${d.workout.notes} Deload: keep effort controlled.`,
			},
		};
	});
}

function scaleWeekVolume(days, targetMinutes, capMinutes) {
	const total = days.reduce((sum, d) => sum + (d.workout.minutes || 0), 0);
	if (!targetMinutes || total === 0) return days;

	const rawScale = targetMinutes / total;
	const scale = clamp(rawScale, 0.85, 1.15);

	return days.map((d) => {
		if (d.workout.minutes == null) return d;
		let minutes = Math.max(20, Math.round(d.workout.minutes * scale));
		if (d.slot === "long_run" && capMinutes) {
			minutes = Math.min(minutes, capMinutes);
		}
		return {
			...d,
			workout: {
				...d.workout,
				minutes,
			},
		};
	});
}

function getPhaseForWeek(goal, blockWeeks, weekNumber) {
	const profile = runProfilesData?.profiles?.[goal];
	const splits = profile?.phaseSplits?.[String(blockWeeks)];
	if (!splits) {
		return weekNumber === blockWeeks ? "race_week" : "build";
	}

	const raceWeekNumber = blockWeeks;
	if (weekNumber === raceWeekNumber) return "race_week";

	const taperStart = blockWeeks - splits.taper;
	if (weekNumber > taperStart) return "taper";

	const baseEnd = splits.base;
	const buildEnd = splits.base + splits.build;
	const specificityEnd = splits.base + splits.build + splits.specificity;

	if (weekNumber <= baseEnd) return "base";
	if (weekNumber <= buildEnd) return "build";
	if (weekNumber <= specificityEnd) return "specificity";
	return "build";
}

function getMarathonMPSegment(goal, experience, hoursBucketId, weekIndex, phase, isDeload) {
	if (goal !== "marathon") return "";
	if (experience === "new") return "";
	if (phase !== "build" && phase !== "specificity") return "";
	if (isDeload) return "";

	const cfg = getLongRunConfig(goal);
	const segments = cfg?.mpSegments?.[hoursBucketId];
	const every = cfg?.mpEveryWeeks ?? 2;
	if (!segments?.length) return "";
	if (weekIndex % every !== 1) return "";

	const idx = Math.floor(weekIndex / every) % segments.length;
	return segments[idx];
}

function getNewRunnerBaseWeeks(goal, blockWeeks) {
	const profile = runProfilesData?.profiles?.[goal];
	const weeks = profile?.newRunnerBaseWeeks?.[String(blockWeeks)];
	return weeks ?? 0;
}

export function generateRunPlan(selection) {
	const { goal, hoursBucketId, structureId, experience, blockWeeks, shiftMode } = selection;

	if (!RUN_GOALS.includes(goal)) {
		throw new Error("Running generator supports: 10k, half, marathon.");
	}

	const goalProfile = goalProfilesData?.profiles?.[goal];
	const allowedStructures = goalProfile?.constraints?.allowedStructures;
	if (allowedStructures?.length && !allowedStructures.includes(structureId)) {
		throw new Error("Invalid week structure for selected goal.");
	}

	const hoursCapByStructure = goalProfile?.constraints?.hoursCapByStructure;
	if (hoursCapByStructure?.[structureId]) {
		const cap = hoursCapByStructure[structureId];
		if (bucketIndex(hoursBucketId) > bucketIndex(cap)) {
			throw new Error("Selected hours are not possible for this week structure.");
		}
	}

	const structure = getStructure(structureId);
	const prog = progressionForExperience(experience);

	const raceWeekNumber = blockWeeks;

	const warnings = [];

	// Guard: new runner + 5–6 days/week + higher hours bucket can be risky
	if (
		experience === "new" &&
		isFiveSixDaysStructure(structureId) &&
		(hoursBucketId === "h_8_10" || hoursBucketId === "h_10_12")
	) {
		warnings.push(
			"Guard rail: New runner + 5–6 days/week + high hours is risky. This generator will keep runs short and make extra days optional."
		);
	}

	const weeks = [];

	for (let w = 1; w <= blockWeeks; w++) {
		const weekIndex = w - 1;
		const isDeload = w % prog.deloadEvery === 0;
		const earlyBaseNew =
			experience === "new" && w <= getNewRunnerBaseWeeks(goal, blockWeeks);

		const isRaceWeek = w === raceWeekNumber;
		const weeksBeforeRaceWeek = raceWeekNumber - w; // 0 = race week, 1 = 1 week before, etc.
		const phase = earlyBaseNew ? "base" : getPhaseForWeek(goal, blockWeeks, w);
		const inTaper = phase === "taper" || phase === "race_week";

		const factor = inTaper ? taperFactor(goal, weeksBeforeRaceWeek) : 1;

		let days = structure.pattern.map((p) => {
			const workout = buildRunWorkout(
				p.slot,
				goal,
				weekIndex,
				experience,
				hoursBucketId,
				factor,
				structureId,
				phase,
				earlyBaseNew,
				isDeload
			);
			const isKey = p.slot === "quality_1" || p.slot === "quality_2" || p.slot === "long_run";

			return { day: p.day, slot: p.slot, isKey, workout };
		});

		// Race week: Sunday is race day (replace long run session)
		if (isRaceWeek) {
			days = days.map((d) => {
				if (d.day === "Sun") {
					return {
						...d,
						slot: "race",
						isKey: true,
						workout: buildRaceWorkout(goal),
					};
				}
				return d;
			});
		}

		if (shiftMode) days = applyShiftReflow(days);

		// Deload reduces volume (but don’t fight taper/race week)
		if (isDeload && !inTaper) {
			days = applyDeloadAdjustments(days);
		}

		const volumeTarget = runProfilesData?.profiles?.[goal]?.volumeTargets?.[hoursBucketId];
		if (!isRaceWeek && !isDeload) {
			const longRunCap = getGoalLongRunCap(goal, experience);
			const target = inTaper && volumeTarget ? Math.round(volumeTarget * factor) : volumeTarget;
			days = scaleWeekVolume(days, target, longRunCap);
		}

		weeks.push({
			week: w,
			phase, // "base" | "build" | "specificity" | "taper" | "race_week"
			isDeload,
			days,
		});
	}

	return {
		id: `plan_${goal}_${hoursBucketId}_${structureId}_${experience}_${blockWeeks}_${shiftMode ? "shift" : "normal"}`,
		selection,
		warnings,
		generatedAt: new Date().toISOString(),
		weeks,
	};
}
