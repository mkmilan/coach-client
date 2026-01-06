import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './page.module.scss';
import Configurator from './Configurator';
import { FREE_PLAN_GOALS, getGoalBySlug } from '@/data/freePlanGoals';

export async function generateStaticParams() {
	return FREE_PLAN_GOALS.map((goal) => ({ goal: goal.slug }));
}

export async function generateMetadata({ params }) {
	const resolvedParams = await params;
	const goal = getGoalBySlug(resolvedParams.goal);
	if (!goal) {
		return {
			title: 'Plan not found — Endurance Coaching',
			description: 'Pick a goal to build your free starter plan.',
		};
	}

	return {
		title: `${goal.label} Starter Plan — Endurance Coaching`,
		description: `Build a ${goal.label} starter plan matched to your time, experience, and focus areas.`,
	};
}

export default async function GoalPlanPage({ params }) {
	const resolvedParams = await params;
	const goal = getGoalBySlug(resolvedParams.goal);
	if (!goal) notFound();

	return (
		<div className={styles.wrapper}>
			<Link href="/free-plan" className={styles.backLink}>
				<span aria-hidden="true">←</span> All goals
			</Link>

			<section className={`card ${styles.headerCard}`}>
				<div>
					<p className="eyebrow">{goal.label}</p>
					<h1 className="h1">Starter plan builder</h1>
				</div>
				<p>
					Work through the sliders below to outline a training block you
					can trust. Once you like the mix, generate a preview (and keep
					the summary for your notes) to see how it would look in practice.
				</p>
			</section>

			<Configurator goal={goal} />
		</div>
	);
}
