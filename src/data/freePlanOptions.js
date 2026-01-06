export const HOUR_WINDOWS = [
	{
		value: '4-6',
		label: '4–6h',
		description:
			'Two key sessions + two easy fillers. Sustainable base building.',
	},
	{
		value: '6-8',
		label: '6–8h',
		description: 'Add one more quality slot and extend the weekend long run.',
	},
	{
		value: '8-10',
		label: '8–10h',
		description:
			'Full spectrum: intensity, strength endurance, and long aerobic days.',
	},
	{
		value: '10-12',
		label: '10–12h',
		description: 'High-volume focus. Doubles + cross-training ready.',
	},
];

export const WEEK_STRUCTURES = [
	{
		value: '3-key-2-easy',
		label: '3 key + 2 easy',
		description:
			'Tuesday/Thursday quality + weekend long run, with two easy floaters.',
	},
	{
		value: '2-quality-long',
		label: '2 quality + long',
		description:
			'One threshold, one speed, long run focus. Lighter weekly stress.',
	},
	{
		value: 'consistency',
		label: 'Low freq / high consistency',
		description:
			'Shorter daily work, optional doubles, blends endurance + strength.',
	},
];

export const EXPERIENCE_LEVELS = [
	{ value: 'new', label: 'New' },
	{ value: 'intermediate', label: 'Intermediate' },
	{ value: 'advanced', label: 'Advanced' },
];

export const BLOCK_LENGTHS = [8, 12, 16];

export function findOptionByValue(options, value) {
	return options.find((option) => option.value === value) || null;
}
