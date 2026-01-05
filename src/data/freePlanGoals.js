export const FREE_PLAN_GOALS = [
	{
		slug: '10k',
		label: '10K',
		description: 'Get comfortable with consistent 10K volume.',
	},
	{
		slug: 'half-marathon',
		label: 'Half Marathon',
		description: 'Target steady strength + threshold economy.',
	},
	{
		slug: 'marathon',
		label: 'Marathon',
		description: 'Dial in long-run durability + fueling.',
	},
	{
		slug: '70-3',
		label: '70.3',
		description: 'Balance swim/bike/run with smart fatigue blocks.',
	},
	{
		slug: 'ironman',
		label: 'Ironman',
		description: 'Map the full-day build with shift-friendly options.',
	},
];

export function getGoalBySlug(slug) {
	return FREE_PLAN_GOALS.find((goal) => goal.slug === slug);
}
