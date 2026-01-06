import Link from 'next/link';
import styles from './page.module.scss';
import { FREE_PLAN_GOALS } from '@/data/freePlanGoals';

export const metadata = {
	title: 'Free Starter Plan — Endurance Coaching',
	description:
		'Get a free starter plan + practical guidance explained simply.',
};

export default function FreePlanPage() {
	return (
		<section className="card" style={{ padding: 22 }}>
			<h1 className="h1">Free starter plan</h1>
			<p>
				Build your own starter plan without entering an email. Pick a goal,
				set your constraints, and get a simple structure you can follow or
				share.
			</p>

			<div className="card" style={{ padding: 18, marginTop: 14 }}>
				<h2 className="h2">Pick your goal to start</h2>
				<ul style={{ color: 'var(--muted)', margin: 0, paddingLeft: 18 }}>
					<li>Template weeks for each distance</li>
					<li>Load targets matched to your time or day budget</li>
					<li>Shift-friendly mode toggle for rotating schedules</li>
					<li>Generate a backend preview before saving anything</li>
				</ul>

				<div className={styles.goalGrid}>
					{FREE_PLAN_GOALS.map((goal) => (
						<Link
							key={goal.slug}
							href={`/free-plan/${goal.slug}`}
							className={styles.goalCard}
						>
							<div>
								<p className="eyebrow">{goal.label}</p>
								<h3>{goal.description}</h3>
							</div>
							<span>Build plan →</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
