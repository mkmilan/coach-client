import Link from 'next/link';
import styles from './Footer.module.scss';

export default function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles.inner}>
				<p className="small">
					© {new Date().getFullYear()} — Science-based endurance coaching.
					Simple execution.
				</p>
				<p className="small">
					<Link href="/free-plan">Get the free plan</Link> ·{' '}
					<Link href="/contact">Book a consult</Link>
				</p>
			</div>
		</footer>
	);
}
