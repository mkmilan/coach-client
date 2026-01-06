import ladders from '@/data/plans/ladders.json';
import profilesData from '@/data/plans/goalProfiles.json';

function clamp(n, min, max) {
	return Math.max(min, Math.min(max, n));
}

function pickFrom(arr, idx) {
	const i = clamp(idx, 0, arr.length - 1);
	return arr[i];
}

function getProfile(goal) {
	const p = profilesData.profiles?.[goal];
	if (!p) throw new Error('Unknown goal.');
	return p;
}

function progressionForExperience(experience) {
	// Small and safe MVP. You can tune later.
	if (experience === 'new') return { start: 0, stepEvery: 2, deloadEvery: 4 };
	if (experience === 'advanced')
		return { start: 1, stepEvery: 1, deloadEvery: 4 };
	return { start: 0, stepEvery: 1, deloadEvery: 4 }; // intermediate
}

function buildRunWorkout(family, weekIndex, experience, hoursBucketId, goal) {
	const prog = progressionForExperience(experience);
	const step = prog.start + Math.floor(weekIndex / prog.stepEvery);

	if (family === 'easy') {
		const minutes = pickFrom(ladders.run.easyMinutes, step);
		return {
			sport: 'run',
			title: 'Easy run',
			minutes,
			intensity: 'RPE 3–4',
			notes: 'Conversational.',
		};
	}

	if (family === 'long') {
		// long run scaling by hours bucket
		const baseIdx =
			hoursBucketId === 'h_4_6'
				? 0
				: hoursBucketId === 'h_6_8'
				? 1
				: hoursBucketId === 'h_8_10'
				? 2
				: 3;
		const minutes = pickFrom(ladders.run.longMinutes, baseIdx + step);
		return {
			sport: 'run',
			title: 'Long run',
			minutes,
			intensity: 'RPE 4–5',
			notes: 'Steady, no hero pace.',
		};
	}

	if (family === 'threshold') {
		const s = pickFrom(ladders.run.thresholdSteps, step);
		return {
			sport: 'run',
			title: `Threshold ${s.label}`,
			minutes: 55,
			intensity: 'RPE 7 (controlled)',
			details: { sets: s.sets, workMin: s.workMin, restMin: s.restMin },
			notes: 'Stay smooth; stop before form breaks.',
		};
	}

	if (family === 'threshold_marathon') {
		// Marathon tends to prefer longer continuous / longer reps; just bias toward later steps.
		const s = pickFrom(ladders.run.thresholdSteps, step + 1);
		return {
			sport: 'run',
			title: `Marathon-threshold ${s.label}`,
			minutes: 65,
			intensity: 'RPE 6–7',
			details: { sets: s.sets, workMin: s.workMin, restMin: s.restMin },
			notes: 'Think ‘strong and steady’, not sharp.',
		};
	}

	if (family === 'steady_marathon') {
		return {
			sport: 'run',
			title: 'Steady aerobic (marathon-style)',
			minutes: 60,
			intensity: 'RPE 5–6',
			notes: 'Progressive steady: finish slightly faster, no sprint.',
		};
	}

	if (family === 'vo2') {
		// Your rule: never below 3×3 (our ladder already starts at 3×3)
		const s = pickFrom(ladders.run.vo2Steps, step);
		return {
			sport: 'run',
			title: `VO2 ${s.label}`,
			minutes: 60,
			intensity: 'RPE 8–9',
			details: { reps: s.reps, workMin: s.workMin, restMin: s.restMin },
			notes: 'Hard but repeatable. If you fade, stop at same quality.',
		};
	}

	// fallback
	return {
		sport: 'run',
		title: 'Easy run',
		minutes: 45,
		intensity: 'RPE 3–4',
		notes: 'Relaxed.',
	};
}

function buildTriWorkout(slot, weekIndex, experience, hoursBucketId) {
	const prog = progressionForExperience(experience);
	const step = prog.start + Math.floor(weekIndex / prog.stepEvery);

	if (slot === 'swim_aerobic') {
		const minutes = pickFrom(ladders.swim.aerobicMinutes, step);
		return {
			sport: 'swim',
			title: 'Swim aerobic + technique',
			minutes,
			intensity: 'Easy',
			notes: 'Drills + smooth aerobic.',
		};
	}

	if (slot === 'swim_intervals') {
		const s = pickFrom(ladders.swim.intervalSteps, step);
		return {
			sport: 'swim',
			title: `Swim intervals ${s.label}`,
			minutes: 45,
			intensity: 'Moderate-hard',
			details: s,
			notes: 'Focus on form, not fighting.',
		};
	}

	if (slot === 'bike_threshold') {
		const s = pickFrom(ladders.bike.thresholdSteps, step);
		return {
			sport: 'bike',
			title: `Bike threshold ${s.label}`,
			minutes: 75,
			intensity: 'Hard (controlled)',
			details: s,
			notes: 'Steady power, avoid spikes.',
		};
	}

	if (slot === 'bike_z2') {
		const baseIdx =
			hoursBucketId === 'h_4_6'
				? 1
				: hoursBucketId === 'h_6_8'
				? 2
				: hoursBucketId === 'h_8_10'
				? 3
				: 4;
		const minutes = pickFrom(ladders.bike.z2Minutes, baseIdx + step);
		return {
			sport: 'bike',
			title: 'Bike Z2',
			minutes,
			intensity: 'Easy-moderate',
			notes: 'All-day aerobic.',
		};
	}

	if (slot === 'bike_long') {
		const baseIdx =
			hoursBucketId === 'h_4_6'
				? 3
				: hoursBucketId === 'h_6_8'
				? 4
				: hoursBucketId === 'h_8_10'
				? 5
				: 6;
		const minutes = pickFrom(ladders.bike.z2Minutes, baseIdx + step);
		return {
			sport: 'bike',
			title: 'Long bike',
			minutes,
			intensity: 'Z2',
			notes: 'Fueling practice.',
		};
	}

	if (slot === 'run_easy') {
		return buildRunWorkout(
			'easy',
			weekIndex,
			experience,
			hoursBucketId,
			'tri'
		);
	}

	if (slot === 'run_long') {
		return buildRunWorkout(
			'long',
			weekIndex,
			experience,
			hoursBucketId,
			'tri'
		);
	}

	return {
		sport: 'bike',
		title: 'Bike easy',
		minutes: 60,
		intensity: 'Z2',
		notes: 'Relaxed.',
	};
}

function defaultRunStructure(structureId) {
	// Keep your existing structure ids from the builder UI
	if (structureId === 's_2quality_long') {
		return [
			{ day: 'Tue', slot: 'quality_1' },
			{ day: 'Fri', slot: 'quality_2' },
			{ day: 'Sun', slot: 'long_run' },
		];
	}

	if (structureId === 's_lowfreq_consistency') {
		return [
			{ day: 'Mon', slot: 'easy_filler' },
			{ day: 'Wed', slot: 'quality_1' },
			{ day: 'Fri', slot: 'easy_filler' },
			{ day: 'Sun', slot: 'long_run' },
		];
	}

	// default s_3key_2easy
	return [
		{ day: 'Tue', slot: 'quality_1' },
		{ day: 'Thu', slot: 'quality_2' },
		{ day: 'Wed', slot: 'easy_filler' },
		{ day: 'Sat', slot: 'easy_filler' },
		{ day: 'Sun', slot: 'long_run' },
	];
}

function applyShiftReflow(days) {
	// MVP: prevent back-to-back key days by swapping with nearest non-key day.
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

export function generatePlan(selection) {
	const {
		goal,
		hoursBucketId,
		structureId,
		experience,
		blockWeeks,
		shiftMode,
	} = selection;

	const profile = getProfile(goal);
	const prog = progressionForExperience(experience);

	const weeks = [];

	for (let w = 1; w <= blockWeeks; w++) {
		const weekIndex = w - 1;
		const isDeload = w % prog.deloadEvery === 0;

		let days = [];

		if (profile.type === 'tri') {
			days = profile.triWeek.map((p) => {
				const workout = buildTriWorkout(
					p.slot,
					weekIndex,
					experience,
					hoursBucketId
				);
				const isKey = [
					'bike_threshold',
					'swim_intervals',
					'bike_long',
					'run_long',
				].includes(p.slot);
				return { day: p.day, slot: p.slot, isKey, workout };
			});
		} else {
			const pattern = defaultRunStructure(structureId);

			days = pattern.map((p) => {
				const family = profile.keySlots?.[p.slot] || 'easy';
				const workout = buildRunWorkout(
					family,
					weekIndex,
					experience,
					hoursBucketId,
					goal
				);

				const isKey = ['quality_1', 'quality_2', 'long_run'].includes(
					p.slot
				);
				return { day: p.day, slot: p.slot, isKey, workout };
			});
		}

		if (shiftMode) {
			days = applyShiftReflow(days);
		}

		// MVP deload: reduce minutes a bit
		if (isDeload) {
			days = days.map((d) => ({
				...d,
				workout: {
					...d.workout,
					minutes: Math.max(25, Math.round(d.workout.minutes * 0.75)),
				},
			}));
		}

		weeks.push({
			week: w,
			isDeload,
			days,
		});
	}

	return {
		id: `plan_${goal}_${hoursBucketId}_${structureId}_${experience}_${blockWeeks}_${
			shiftMode ? 'shift' : 'normal'
		}`,
		selection,
		generatedAt: new Date().toISOString(),
		weeks,
	};
}
