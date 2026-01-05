import Link from 'next/link';

export const metadata = {
	title: 'About — Endurance Coaching',
	description:
		'Serious but friendly, science-based coaching explained simply.',
};

export default function AboutPage() {
	return (
		<section className="card" style={{ padding: 22 }}>
			<h1 className="h1">About</h1>

			<p>
				I’m Milan — an endurance athlete building a coaching practice around
				a simple idea:
				<b>
					{' '}
					science-based decisions, explained clearly, executed
					consistently.
				</b>
			</p>

			<div className="card" style={{ padding: 18, marginTop: 14 }}>
				<h2 className="h2">How I coach</h2>
				<ul style={{ color: 'var(--muted)', margin: 0, paddingLeft: 18 }}>
					<li>
						Clear weekly structure (key sessions + enough easy volume)
					</li>
					<li>Intensity guidance using RPE + HR/power when available</li>
					<li>Weekly adjustments based on fatigue and schedule</li>
					<li>
						Shift-friendly rules: move sessions without losing the point
						of the week
					</li>
				</ul>
			</div>

			<div
				style={{
					marginTop: 16,
					display: 'flex',
					gap: 12,
					flexWrap: 'wrap',
				}}
			>
				<Link className="btn btnPrimary" href="/free-plan">
					Get the free plan
				</Link>
				<Link className="btn" href="/contact">
					Book a consult
				</Link>
			</div>
		</section>
	);
}
