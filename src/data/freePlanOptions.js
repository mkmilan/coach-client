export const HOUR_WINDOWS = [
	{
		value: "4-6",
		label: "4–6h",
		description: "Two key sessions + two easy fillers. Sustainable base building.",
	},
	{
		value: "6-8",
		label: "6–8h",
		description: "Add one more quality slot and extend the weekend long run.",
	},
	{
		value: "8-10",
		label: "8–10h",
		description: "Full spectrum: intensity, strength endurance, and long aerobic days.",
	},
	{
		value: "10-12",
		label: "10–12h",
		description: "High-volume focus. Doubles + cross-training ready.",
	},
];

export const WEEK_STRUCTURES = [
	{
		value: "s_3key_2easy",
		label: "3 days / week",
		description: "One quality, one easy support day, and a Sunday long run. Minimal time, high intent.",
	},
	{
		value: "s_2quality_long",
		label: "4 days / week",
		description: "Two quality sessions, one easy volume day, and a long run for balanced stress.",
	},
	{
		value: "s_lowfreq_consistency",
		label: "5–6 days / week",
		description: "Two key sessions, optional mid-week filler, and steady easy mileage with a long run.",
	},
	{
		value: "s_highfreq_ironman",
		label: "5–7 days / week",
		description: "High-frequency structure with optional doubles for Ironman volume.",
	},
];

export const EXPERIENCE_LEVELS = [
	{ value: "new", label: "New" },
	{ value: "intermediate", label: "Intermediate" },
	{ value: "advanced", label: "Advanced" },
];

export const BLOCK_LENGTHS = [8, 12, 16];

export function findOptionByValue(options, value) {
	return options.find((option) => option.value === value) || null;
}
