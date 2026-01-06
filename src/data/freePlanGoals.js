export const FREE_PLAN_GOALS = [
	{
		slug: '10k',
		planId: '10k',
		label: '10K',
		description: 'Get comfortable with consistent 10K volume.',
	},
	{
		slug: 'half-marathon',
		planId: 'half',
		label: 'Half Marathon',
		description: 'Target steady strength + threshold economy.',
	},
	{
		slug: 'marathon',
		planId: 'marathon',
		label: 'Marathon',
		description: 'Dial in long-run durability + fueling.',
	},
	{
		slug: '70-3',
		planId: '70.3',
		label: '70.3',
		description: 'Balance swim/bike/run with smart fatigue blocks.',
	},
	{
		slug: 'ironman',
		planId: 'ironman',
		label: 'Ironman',
		description: 'Map the full-day build with shift-friendly options.',
	},
];

export function getGoalBySlug(slug) {
	return FREE_PLAN_GOALS.find((goal) => goal.slug === slug);
}

export function getGoalByPlanId(planId) {
	return FREE_PLAN_GOALS.find((goal) => goal.planId === planId);
}
