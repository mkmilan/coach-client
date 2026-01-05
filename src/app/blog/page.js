import Link from 'next/link';
import { getAllPostsMeta } from '@/lib/blog';

export const metadata = {
	title: 'Blog — Endurance Coaching',
	description: 'Training and physiology explained simply.',
};

export default function BlogIndexPage() {
	const posts = getAllPostsMeta();

	return (
		<section className="card" style={{ padding: 22 }}>
			<h1 className="h1">Blog</h1>
			<p>Science-based training topics explained in simple language.</p>

			<div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
				{posts.map((p) => (
					<Link
						key={p.slug}
						href={`/blog/${p.slug}`}
						className="card"
						style={{ padding: 16, display: 'block' }}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								gap: 12,
								flexWrap: 'wrap',
							}}
						>
							<h2 className="h2" style={{ margin: 0 }}>
								{p.title}
							</h2>
							{p.date ? <span className="small">{p.date}</span> : null}
						</div>
						<p style={{ marginTop: 8 }}>{p.excerpt}</p>
						{p.tags?.length ? (
							<p className="small">Tags: {p.tags.join(', ')}</p>
						) : null}
					</Link>
				))}
			</div>
		</section>
	);
}
