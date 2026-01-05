function isValidEmail(email) {
	return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req) {
	try {
		const body = await req.json();
		const email = (body.email || '').trim().toLowerCase();
		const name = (body.name || '').trim();
		const source = (body.source || 'unknown').trim();

		if (!isValidEmail(email)) {
			return new Response(
				JSON.stringify({ error: 'Please enter a valid email.' }),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		// ✅ For launch: log the lead. Replace later with your email provider (ConvertKit/MailerLite/etc).
		console.log('[LEAD]', {
			email,
			name,
			source,
			at: new Date().toISOString(),
		});

		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		return new Response(
			JSON.stringify({ error: 'Server error. Try again.' }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}
