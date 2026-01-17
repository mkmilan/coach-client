import {
	BLOCK_LENGTHS,
	EXPERIENCE_LEVELS,
	HOUR_WINDOWS,
	WEEK_STRUCTURES,
} from '@/data/freePlanOptions';
import {
	FREE_PLAN_GOALS,
	getGoalByPlanId,
	getGoalBySlug,
} from '@/data/freePlanGoals';
import goalProfilesData from '@/data/plans/goalProfiles.json';

const HOURS_DEFAULT_VALUE = HOUR_WINDOWS[1]?.value || HOUR_WINDOWS[0]?.value;
const HOURS_VALUE_TO_BUCKET = HOUR_WINDOWS.reduce((acc, option) => {
	const bucketId = `h_${option.value.replace('-', '_')}`;
	acc[option.value] = bucketId;
	acc[bucketId] = bucketId;
	return acc;
}, {});
const HOURS_BUCKET_LABEL = HOUR_WINDOWS.reduce((acc, option) => {
	const bucketId = `h_${option.value.replace('-', '_')}`;
	acc[bucketId] = option.label;
	return acc;
}, {});

const STRUCTURE_DEFAULT_VALUE = WEEK_STRUCTURES[0]?.value;
const STRUCTURE_VALUE_TO_ID = {
	'3-key-2-easy': 's_3key_2easy',
	s_3key_2easy: 's_3key_2easy',
	'2-quality-long': 's_2quality_long',
	s_2quality_long: 's_2quality_long',
	consistency: 's_lowfreq_consistency',
	s_lowfreq_consistency: 's_lowfreq_consistency',
	highfreq_ironman: 's_highfreq_ironman',
	s_highfreq_ironman: 's_highfreq_ironman',
};
const STRUCTURE_LABEL_BY_ID = WEEK_STRUCTURES.reduce((acc, option) => {
	const id = STRUCTURE_VALUE_TO_ID[option.value] || option.value;
	acc[id] = option.label;
	return acc;
}, {});

const EXPERIENCE_DEFAULT = EXPERIENCE_LEVELS[1] || EXPERIENCE_LEVELS[0];
const BLOCK_DEFAULT = BLOCK_LENGTHS?.includes(12)
	? 12
	: BLOCK_LENGTHS?.[0] || 12;

function firstValue(value) {
	if (Array.isArray(value)) return value[0];
	return value ?? '';
}

function hasParams(params = {}) {
	return Object.values(params).some((value) => value !== undefined);
}

function normalizeHours(value) {
	const fallbackBucket = HOURS_VALUE_TO_BUCKET[HOURS_DEFAULT_VALUE] || 'h_6_8';
	if (!value) return fallbackBucket;
	return HOURS_VALUE_TO_BUCKET[value] || fallbackBucket;
}

function normalizeStructure(value) {
	const fallback =
		STRUCTURE_VALUE_TO_ID[STRUCTURE_DEFAULT_VALUE] || 's_3key_2easy';
	if (!value) return fallback;
	return STRUCTURE_VALUE_TO_ID[value] || fallback;
}

function guardStructureForGoal(goalId, structureId) {
	const goalProfile = goalProfilesData?.profiles?.[goalId];
	const allowed = goalProfile?.constraints?.allowedStructures;
	if (!allowed?.length) return structureId;
	if (allowed.includes(structureId)) return structureId;
	return allowed[0];
}

function bucketIndex(bucketId) {
	const order = ['h_4_6', 'h_6_8', 'h_8_10', 'h_10_12'];
	return order.indexOf(bucketId);
}

function guardHoursForStructure(goalId, structureId, hoursBucketId) {
	const goalProfile = goalProfilesData?.profiles?.[goalId];
	const hoursCap = goalProfile?.constraints?.hoursCapByStructure?.[structureId];
	if (!hoursCap) return hoursBucketId;
	if (bucketIndex(hoursBucketId) <= bucketIndex(hoursCap)) return hoursBucketId;
	return hoursCap;
}

function normalizeExperience(value) {
	return (
		EXPERIENCE_LEVELS.find((opt) => opt.value === value) || EXPERIENCE_DEFAULT
	);
}

function normalizeBlockLength(value) {
	const numeric = parseInt(value, 10);
	if (BLOCK_LENGTHS?.includes(numeric)) return numeric;
	return BLOCK_DEFAULT;
}

function normalizeShiftMode(value) {
	if (typeof value === 'boolean') return value;
	if (value === undefined || value === null) return false;
	return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
}

export function buildSelectionModel(rawParams = {}) {
	if (!hasParams(rawParams)) return null;
	const goalInput =
		firstValue(rawParams.goal) ||
		firstValue(rawParams.goalId) ||
		firstValue(rawParams.goalSlug);
	if (!goalInput) return null;

	const goalMeta =
		getGoalByPlanId(goalInput) ||
		getGoalBySlug(goalInput) ||
		FREE_PLAN_GOALS[0];
	if (!goalMeta) return null;

	const hoursValue =
		firstValue(rawParams.hoursBucketId) || firstValue(rawParams.hours);
	const structureValue =
		firstValue(rawParams.structureId) || firstValue(rawParams.structure);
	const experienceValue = firstValue(rawParams.experience);
	const blockValue =
		firstValue(rawParams.blockWeeks) || firstValue(rawParams.blockLength);
	const shiftValue = firstValue(rawParams.shiftMode);

	const experienceOption = normalizeExperience(experienceValue);
	const normalizedStructure = guardStructureForGoal(
		goalMeta.planId,
		normalizeStructure(structureValue)
	);
	const normalizedHours = guardHoursForStructure(
		goalMeta.planId,
		normalizedStructure,
		normalizeHours(hoursValue)
	);
	const normalized = {
		goal: goalMeta.planId,
		hoursBucketId: normalizedHours,
		structureId: normalizedStructure,
		experience: experienceOption.value,
		blockWeeks: normalizeBlockLength(blockValue),
		shiftMode: normalizeShiftMode(shiftValue),
	};

	const display = {
		goal: goalMeta,
		hoursLabel:
			HOURS_BUCKET_LABEL[normalized.hoursBucketId] ||
			HOURS_BUCKET_LABEL[HOURS_VALUE_TO_BUCKET[HOURS_DEFAULT_VALUE]],
		structureLabel:
			STRUCTURE_LABEL_BY_ID[normalized.structureId] || 'Weekly structure',
		experienceLabel: experienceOption.label,
		blockLabel: `${normalized.blockWeeks} weeks`,
		shiftLabel: normalized.shiftMode ? 'On' : 'Off',
	};

	const summaryText = [
		`Goal: ${display.goal.label}`,
		`Hours/week: ${display.hoursLabel}`,
		`Week structure: ${display.structureLabel}`,
		`Experience: ${display.experienceLabel}`,
		`Block length: ${display.blockLabel}`,
		`Shift-work mode: ${display.shiftLabel}`,
	].join('\n');

	return {
		normalized,
		display,
		summaryText,
		backHref: `/free-plan/${goalMeta.slug}`,
	};
}
