import bioenergetics from './bioenergetics-basics.json';
import threshold from './threshold-simple-guide.json';

export const posts = [bioenergetics, threshold];

export function getPost(slug) {
	return posts.find((post) => post.slug === slug);
}
