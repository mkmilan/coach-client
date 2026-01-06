import { headers } from 'next/headers';
import PreviewClient from './PreviewClient';
import { buildSelectionModel } from './selection';

export const dynamic = 'force-dynamic';

async function getBaseUrl() {
	const headerList = await headers();
	const host = headerList.get('x-forwarded-host') || headerList.get('host');
	const protocol = headerList.get('x-forwarded-proto') || 'http';
	if (host) {
		return `${protocol}://${host}`;
	}
	return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

function paramsToObject(params) {
	if (!params) return {};
	if (typeof params.entries === 'function') {
		const out = {};
		for (const [key, value] of params.entries()) {
			if (out[key] === undefined) {
				out[key] = value;
			} else if (Array.isArray(out[key])) {
				out[key].push(value);
			} else {
				out[key] = [out[key], value];
			}
		}
		return out;
	}
	return params;
}

async function requestPlan(selection) {
	const baseUrl = await getBaseUrl();
	const response = await fetch(`${baseUrl}/api/plans/generate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(selection.normalized),
		cache: 'no-store',
		next: { revalidate: 0 },
	});

	if (!response.ok) {
		const payload = await response.json().catch(() => ({}));
		return { plan: null, error: payload.error || 'Unable to generate plan.' };
	}

	const payload = await response.json();
	return { plan: payload.plan, error: '' };
}

export default async function PreviewPage({ searchParams }) {
	const resolvedParams = (await searchParams) || {};
	const selection = buildSelectionModel(paramsToObject(resolvedParams));

	if (!selection) {
		return (
			<PreviewClient
				selection={null}
				plan={null}
				errorMessage=""
				isLoading={false}
			/>
		);
	}

	let plan = null;
	let errorMessage = '';

	try {
		const result = await requestPlan(selection);
		plan = result.plan;
		errorMessage = result.error;
	} catch (err) {
		errorMessage = err.message || 'Unable to generate plan.';
	}

	return (
		<PreviewClient
			selection={selection}
			plan={plan}
			errorMessage={errorMessage}
			isLoading={false}
		/>
	);
}
