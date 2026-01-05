import Link from 'next/link';

export default function HomePage() {
	return (
		<div className="grid2">
			<section className="card" style={{ padding: 22 }}>
				<h1 className="h1">
					Serious coaching. Friendly delivery. Simple execution.
				</h1>
				<p>
					Training for <b>10K, Half, Marathon, 70.3</b>, and <b>Ironman</b>
					. Science-based decisions explained in plain language — so you
					understand what you’re doing and why.
				</p>

				<div
					style={{
						display: 'flex',
						gap: 12,
						flexWrap: 'wrap',
						marginTop: 14,
					}}
				>
					<Link className="btn btnPrimary" href="/free-plan">
						Get the free starter plan
					</Link>
					<Link className="btn" href="/coaching">
						See coaching options
					</Link>
				</div>

				<div style={{ marginTop: 18 }}>
					<p className="small">
						Shift work? No problem — plans adapt to rotating schedules
						without losing the point of the week.
					</p>
				</div>
			</section>

			<aside className="card" style={{ padding: 22 }}>
				<h2 className="h2">How it works</h2>
				<p>1) We set your goal + constraints.</p>
				<p>2) You get a clear weekly structure.</p>
				<p>3) We adjust based on fatigue + real life.</p>

				<div style={{ marginTop: 16 }}>
					<h2 className="h2">Start here</h2>
					<p className="small">
						Free plan includes pacing guidance + example weeks + “if tired
						do this instead” rules.
					</p>
					<Link className="btn btnPrimary" href="/free-plan">
						Download free plan
					</Link>
				</div>
			</aside>
		</div>
	);
}
