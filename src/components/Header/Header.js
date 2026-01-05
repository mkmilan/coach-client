import Link from 'next/link';
import styles from './Header.module.scss';

export default function Header() {
	return (
		<header className={styles.header}>
			<div className={styles.inner}>
				<Link href="/" className={styles.brand}>
					<span className={styles.dot} />
					<span>Endurance Coaching</span>
				</Link>

				<nav className={styles.nav}>
					<Link href="/coaching">Coaching</Link>
					<Link href="/free-plan">Free Plan</Link>
					<Link href="/blog">Blog</Link>
					<Link href="/about">About</Link>
					<Link href="/contact">Contact</Link>
				</nav>
			</div>
		</header>
	);
}
