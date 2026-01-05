import '@/styles/globals.scss';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const metadata = {
	title: 'Endurance Coaching — science-based, simple',
	description:
		'Serious but friendly endurance coaching for 10K, half, marathon, 70.3 and Ironman. Science-based explanations, simple execution.',
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>
				<Header />
				<main className="container">{children}</main>
				<Footer />
			</body>
		</html>
	);
}
