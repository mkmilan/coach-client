export const metadata = {
	title: 'Contact — Endurance Coaching',
	description: 'Book a consult or contact for coaching.',
};

export default function ContactPage() {
	return (
		<section className="card" style={{ padding: 22 }}>
			<h1 className="h1">Contact</h1>
			<p>
				For now, keep this simple. Add your Calendly link or an email
				address.
			</p>

			<div className="card" style={{ padding: 18, marginTop: 14 }}>
				<h2 className="h2">Book</h2>
				<p className="small">
					Paste your booking link here (Calendly, TidyCal, etc.).
				</p>
				<p style={{ color: 'var(--muted)' }}>
					Email: <b>you@yourdomain.com</b>
				</p>
			</div>
		</section>
	);
}
