import { generatePlan } from '@/lib/planGenerator';

export async function POST(req) {
	try {
		const selection = await req.json();
		const plan = generatePlan(selection);

		return new Response(JSON.stringify({ plan }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		return new Response(
			JSON.stringify({ error: err.message || 'Failed to generate plan.' }),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}
