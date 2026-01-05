import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { posts, getPost } from '@/data/blog/posts';

function normalizeMeta(post) {
	return {
		slug: post.slug,
		title: post.title,
		date: post.date ?? null,
		excerpt: post.excerpt ?? '',
		tags: Array.isArray(post.tags) ? post.tags : [],
	};
}

export function getAllPostsMeta() {
	return posts
		.map((post) => normalizeMeta(post))
		.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export async function getPostBySlug(slug) {
	const post = getPost(slug);
	if (!post) {
		throw new Error(`Post with slug "${slug}" not found.`);
	}

	const processed = await remark()
		.use(remarkGfm)
		.use(remarkHtml, { sanitize: false })
		.process(post.body || '');

	return {
		...post,
		html: processed.toString(),
	};
}
