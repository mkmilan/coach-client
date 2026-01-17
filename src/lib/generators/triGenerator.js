import ladders from "@/data/plans/ladders.json";
import goalProfilesData from "@/data/plans/goalProfiles.json";
import triProfilesData from "@/data/plans/triProfiles.json";

const TRI_GOALS = ["70.3", "ironman"];

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
	if (experience === "new") return { start: 0, stepEvery: 3, deloadEvery: 4 };
	if (experience === "advanced") return { start: 1, stepEvery: 1, deloadEvery: 4 };
	return { start: 0, stepEvery: 2, deloadEvery: 4 };
}

function getProfile(goal) {
	return triProfilesData?.profiles?.[goal] || null;
}

function getTaperWeeksBeforeRace(goal) {
	if (goal === "70.3") return 2;
	if (goal === "ironman") return 3;
	return 2;
}

function taperFactor(weeksFromRaceWeek) {
	if (weeksFromRaceWeek === 2) return 0.85;
	if (weeksFromRaceWeek === 1) return 0.7;
	if (weeksFromRaceWeek === 0) return 0.6;
	return 1;
}

function getPhaseForWeek(goal, blockWeeks, weekNumber) {
	const profile = getProfile(goal);
	const splits = profile?.phaseSplits?.[String(blockWeeks)];
	if (!splits) {
		return weekNumber === blockWeeks ? "race_week" : "build";
	}

	if (weekNumber === blockWeeks) return "race_week";

	const taperStart = blockWeeks - splits.taper;
	if (weekNumber > taperStart) return "taper";

	const baseEnd = splits.base;
	const buildEnd = splits.base + splits.build;
	const specEnd = splits.base + splits.build + splits.specificity;

	if (weekNumber <= baseEnd) return "base";
	if (weekNumber <= buildEnd) return "build";
	if (weekNumber <= specEnd) return "specificity";
	return "build";
}

function getRunLongCap(goal, experience) {
	const profile = getProfile(goal);
	return profile?.caps?.runLongByExperience?.[experience] || 90;
}

function getBikeLongCap(goal, experience) {
	const profile = getProfile(goal);
	return profile?.caps?.bikeLongByExperience?.[experience] || 180;
}

function getVolumeTarget(goal, hoursBucketId) {
	const profile = getProfile(goal);
	return profile?.volumeTargets?.[hoursBucketId] || null;
}

function buildRaceWorkout(goal) {
	const label = goal === "70.3" ? "70.3" : "Ironman";
	return {
		sport: "tri",
		title: `Race day — ${label}`,
		minutes: null,
		intensity: "Race effort",
		notes: "Swim + bike + run. Fuel early and often. Execute pacing.",
	};
}

function buildTriWorkout(slot, goal, weekIndex, experience, phase, hoursBucketId) {
	const prog = progressionForExperience(experience);
	const step = prog.start + Math.floor(weekIndex / prog.stepEvery);

	if (slot === "swim_aerobic") {
		const base = pickFrom(ladders.swim.aerobicMinutes, step);
		const factor = phase === "base" ? 0.95 : 1;
		return {
			sport: "swim",
			title: "Aerobic swim",
			minutes: Math.max(25, Math.round(base * factor)),
			intensity: "Easy aerobic",
			notes: "Long strokes. Smooth rhythm.",
		};
	}

	if (slot === "swim_intervals") {
		const s = pickFrom(ladders.swim.intervalSteps, step);
		return {
			sport: "swim",
			title: `Swim intervals ${s.label}`,
			minutes: Math.max(30, Math.round(45)),
			intensity: "Moderate-hard",
			details: { reps: s.reps, work: s.work, restSec: s.restSec },
			notes: "Consistent pace. Strong but controlled.",
		};
	}

	if (slot === "bike_threshold") {
		const s = pickFrom(ladders.bike.thresholdSteps, step);
		const baseMinutes = experience === "new" ? 55 : 70;
		const factor = phase === "base" ? 0.9 : 1;
		return {
			sport: "bike",
			title: `Bike threshold ${s.label}`,
			minutes: Math.max(45, Math.round(baseMinutes * factor)),
			intensity: "RPE 7 (controlled)",
			details: { sets: s.sets, workMin: s.workMin, restMin: s.restMin },
			notes: "Steady power. Smooth cadence.",
		};
	}

	if (slot === "bike_z2") {
		const base = pickFrom(ladders.bike.z2Minutes, step);
		return {
			sport: "bike",
			title: "Bike endurance",
			minutes: Math.max(45, Math.round(base)),
			intensity: "Z2 aerobic",
			notes: "Relaxed endurance. Keep it steady.",
		};
	}

	if (slot === "bike_long") {
		const base = pickFrom(ladders.bike.longMinutes, step);
		const cap = getBikeLongCap(goal, experience);
		const minutes = clamp(base, 60, cap);
		return {
			sport: "bike",
			title: "Long ride",
			minutes: Math.max(60, Math.round(minutes)),
			intensity: "Z2 aerobic",
			notes: "Steady endurance. Practice fueling.",
		};
	}

	if (slot === "run_easy") {
		const base = pickFrom(ladders.run.easyMinutes, step);
		const safe = experience === "new" ? Math.min(base, 40) : base;
		return {
			sport: "run",
			title: "Easy run",
			minutes: Math.max(20, Math.round(safe)),
			intensity: "RPE 3–4",
			notes: "Relaxed aerobic run.",
		};
	}

	if (slot === "run_threshold") {
		const s = pickFrom(ladders.run.thresholdSteps, step);
		const baseMinutes = experience === "new" ? 40 : 50;
		return {
			sport: "run",
			title: `Run threshold ${s.label}`,
			minutes: Math.max(35, Math.round(baseMinutes)),
			intensity: "RPE 7",
			details: { sets: s.sets, workMin: s.workMin, restMin: s.restMin },
			notes: "Controlled effort. Smooth form.",
		};
	}

	if (slot === "run_long") {
		const cap = getRunLongCap(goal, experience);
		const start = experience === "new" ? 50 : 60;
		const minutes = clamp(start + weekIndex * 5, start, cap);
		return {
			sport: "run",
			title: "Long run",
			minutes: Math.max(40, Math.round(minutes)),
			intensity: "RPE 4–5",
			notes: "Steady endurance. No hero pace.",
		};
	}

	if (slot === "run_brick") {
		const minutes = experience === "new" ? 20 : 25;
		return {
			sport: "run",
			title: "Brick run",
			minutes,
			intensity: "RPE 4–5",
			notes: "Short transition run. Focus on cadence.",
		};
	}

	return {
		sport: "bike",
		title: "Easy endurance",
		minutes: 40,
		intensity: "Z2",
		notes: "Steady.",
	};
}

function scaleMinutesBySport(sessions, distribution, totalTarget) {
	if (!distribution || !totalTarget) return sessions;

	const bySport = sessions.reduce((acc, s) => {
		acc[s.sport] = (acc[s.sport] || 0) + (s.minutes || 0);
		return acc;
	}, {});

	const scaled = sessions.map((s) => {
		const sportTotal = bySport[s.sport] || 0;
		const target = totalTarget * (distribution[s.sport] || 0);
		if (!sportTotal || !target) return s;
		const scale = clamp(target / sportTotal, 0.8, 1.25);
		const min = s.sport === "swim" ? 25 : 20;
		return {
			...s,
			minutes: Math.max(min, Math.round(s.minutes * scale)),
		};
	});

	const total = scaled.reduce((sum, s) => sum + (s.minutes || 0), 0);
	if (!total) return scaled;
	const overall = clamp(totalTarget / total, 0.9, 1.1);
	if (overall === 1) return scaled;

	return scaled.map((s) => ({
		...s,
		minutes: Math.max(s.sport === "swim" ? 25 : 20, Math.round(s.minutes * overall)),
	}));
}

function applyDeloadAdjustments(sessions) {
	return sessions.map((s) => ({
		...s,
		minutes: s.minutes == null ? null : Math.max(20, Math.round(s.minutes * 0.75)),
		notes: `${s.notes} Deload: keep effort controlled.`,
	}));
}

export function generateTriPlan(selection) {
	const { goal, hoursBucketId, structureId, experience, blockWeeks, shiftMode } = selection;

	if (!TRI_GOALS.includes(goal)) {
		throw new Error("Triathlon generator supports: 70.3, ironman.");
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

	const distribution = goalProfile?.distribution || null;
	const weekTemplate = goalProfile?.triWeek || [];
	const prog = progressionForExperience(experience);
	const taperBefore = Math.min(getTaperWeeksBeforeRace(goal), Math.max(0, blockWeeks - 1));
	const raceWeekNumber = blockWeeks;

	const warnings = [];

	if (experience === "new" && (hoursBucketId === "h_10_12" || hoursBucketId === "h_8_10")) {
		warnings.push("Guard rail: New triathlete + high hours is risky. Keep intensity controlled.");
	}

	const weeks = [];

	for (let w = 1; w <= blockWeeks; w++) {
		const weekIndex = w - 1;
		const isDeload = w % prog.deloadEvery === 0;
		const isRaceWeek = w === raceWeekNumber;
		const weeksBeforeRaceWeek = raceWeekNumber - w;
		const inTaper = weeksBeforeRaceWeek <= taperBefore;
		const phase = getPhaseForWeek(goal, blockWeeks, w);

		const factor = inTaper ? taperFactor(weeksBeforeRaceWeek) : 1;

		let sessions = [];

		for (const day of weekTemplate) {
			const daySessions = day.sessions || [];
			for (const session of daySessions) {
				const workout = buildTriWorkout(session.slot, goal, weekIndex, experience, phase, hoursBucketId);
				const minutes = workout.minutes == null ? null : Math.max(20, Math.round(workout.minutes * factor));
				const isKey =
					session.slot.includes("threshold") ||
					session.slot.includes("long") ||
					session.slot.includes("intervals");
				sessions.push({
					day: day.day,
					slot: session.slot,
					timeOfDay: session.timeOfDay || "",
					isKey,
					...workout,
					minutes,
				});
			}
		}

		if (isRaceWeek) {
			sessions = sessions.map((s) => ({
				...s,
				minutes: s.minutes == null ? null : Math.max(20, Math.round(s.minutes * 0.6)),
				notes: `${s.notes} Race week: keep it light.`,
			}));
			sessions = sessions.filter((s) => s.day !== "Sun");
			sessions.push({
				day: "Sun",
				slot: "race",
				timeOfDay: "",
				isKey: true,
				...buildRaceWorkout(goal),
			});
		}

		const target = getVolumeTarget(goal, hoursBucketId);
		if (!isRaceWeek && !isDeload) {
			const scaledTarget = inTaper && target ? Math.round(target * factor) : target;
			sessions = scaleMinutesBySport(sessions, distribution, scaledTarget);
		}

		if (isDeload && !inTaper) {
			sessions = applyDeloadAdjustments(sessions);
		}

		const days = sessions.reduce((acc, s) => {
			const existing = acc.find((d) => d.day === s.day);
			const session = {
				sport: s.sport,
				title: s.title,
				minutes: s.minutes,
				intensity: s.intensity,
				details: s.details,
				notes: s.notes,
				timeOfDay: s.timeOfDay,
			};
			if (existing) {
				existing.sessions.push(session);
				existing.isKey = existing.isKey || s.isKey;
			} else {
				acc.push({
					day: s.day,
					isKey: s.isKey,
					sessions: [session],
				});
			}
			return acc;
		}, []);

		weeks.push({
			week: w,
			phase,
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
