import Link from 'next/link';
import styles from './page.module.scss';

export const metadata = {
	title: 'Coaching — Endurance Coaching',
	description:
		'1:1 coaching for 10K, Half, Marathon, 70.3 and Ironman. Shift-friendly planning available.',
};

function Tier({ title, points, cta }) {
	return (
		<div className={`card ${styles.tier}`} style={{ padding: 18 }}>
			<h2 className="h2">{title}</h2>
			<ul
				style={{
					color: 'var(--muted)',
					margin: 0,
					paddingLeft: 18,
				}}
			>
				{points.map((p) => (
					<li key={p}>{p}</li>
				))}
			</ul>
			<div className={styles.tierCta}>
				<Link className="btn btnPrimary" href="/contact">
					{cta}
				</Link>
			</div>
		</div>
	);
}

export default function CoachingPage() {
	return (
		<div style={{ display: 'grid', gap: 18 }}>
			<section className="card" style={{ padding: 22 }}>
				<h1 className="h1">Coaching</h1>
				<p>
					You can be “generic” and still be precise: we plan around your
					goal distance and your real-life constraints. Everything is
					science-based — explained simply.
				</p>

				<div className={styles.goalList}>
					{['10K', 'Half Marathon', 'Marathon', '70.3', 'Ironman'].map(
						(x) => (
							<span
								key={x}
								className="card"
								style={{ padding: '8px 10px', borderRadius: 999 }}
							>
								<span
									className="small"
									style={{ color: 'var(--text)' }}
								>
									{x}
								</span>
							</span>
						)
					)}
				</div>
			</section>

			<section className={styles.tiersGrid}>
				<Tier
					title="Plan-only"
					points={[
						'Questionnaire + goal/schedule constraints',
						'4–8 week plan (depends on goal)',
						'1 revision after 7 days',
					]}
					cta="Request plan"
				/>
				<Tier
					title="1:1 Monthly"
					points={[
						'Weekly plan + weekly adjustments',
						'Clear intensity guidance (RPE/HR/power)',
						'Pacing + fueling basics',
						'Works for shifts (rules-based scheduling)',
					]}
					cta="Apply for coaching"
				/>
				<Tier
					title="Consult"
					points={[
						'45 min call: plan, zones, pacing, troubleshooting',
						'You leave with a simple next-step structure',
					]}
					cta="Book a consult"
				/>
			</section>

			<section className="card" style={{ padding: 22 }}>
				<h2 className="h2">Shift workers (optional)</h2>
				<p>
					If you work rotating shifts, the plan adapts with simple rules:
					move sessions to the day your body is ready, while keeping the
					weekly purpose intact.
				</p>
				<Link className="btn" href="/free-plan">
					Get the shift-friendly starter plan
				</Link>
			</section>
		</div>
	);
}
