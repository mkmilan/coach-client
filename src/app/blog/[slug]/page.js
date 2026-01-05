import { getAllPostsMeta, getPostBySlug } from '@/lib/blog';

export async function generateStaticParams() {
	return getAllPostsMeta().map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }) {
	const resolvedParams = await params;
	const post = await getPostBySlug(resolvedParams.slug);

	return (
		<article className="card" style={{ padding: 22 }}>
			<h1 className="h1" style={{ fontSize: 38 }}>
				{post.title}
			</h1>
			{post.date ? <p className="small">{post.date}</p> : null}

			<div
				style={{ marginTop: 14 }}
				dangerouslySetInnerHTML={{ __html: post.html }}
			/>
		</article>
	);
}
