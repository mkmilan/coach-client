'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PlanRenderer from '@/components/PlanRenderer/PlanRenderer';
import { downloadPlanPdf } from '@/lib/pdf/downloadPlanPdf';

export default function PlanPreviewPage() {
	const sp = useSearchParams();

	const selection = useMemo(
		() => ({
			goal: sp.get('goal') || 'half',
			hoursBucketId: sp.get('hours') || 'h_6_8',
			structureId: sp.get('structure') || 's_3key_2easy',
			experience: sp.get('level') || 'intermediate',
			blockWeeks: Number(sp.get('weeks') || 12),
			shiftMode: (sp.get('shift') || '0') === '1',
		}),
		[sp]
	);

	const [plan, setPlan] = useState(null);
	const [state, setState] = useState({ loading: true, error: '' });

	useEffect(() => {
		let alive = true;

		(async () => {
			try {
				setState({ loading: true, error: '' });

				const res = await fetch('/api/plans/generate', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(selection),
				});

				const data = await res.json();
				if (!res.ok)
					throw new Error(data?.error || 'Failed to generate plan.');

				if (!alive) return;
				setPlan(data.plan);
				setState({ loading: false, error: '' });
			} catch (e) {
				if (!alive) return;
				setState({ loading: false, error: e.message || 'Error.' });
			}
		})();

		return () => {
			alive = false;
		};
	}, [selection]);

	if (state.loading) {
		return (
			<section className="card" style={{ padding: 22 }}>
				<p className="small">Generating…</p>
			</section>
		);
	}

	if (state.error) {
		return (
			<section className="card" style={{ padding: 22 }}>
				<p className="small" style={{ color: 'var(--danger)' }}>
					{state.error}
				</p>
			</section>
		);
	}

	return (
		<section className="card" style={{ padding: 22 }}>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					gap: 12,
					flexWrap: 'wrap',
				}}
			>
				<div>
					<h1 className="h1" style={{ fontSize: 34, marginBottom: 6 }}>
						Generated plan
					</h1>
					<p className="small">
						Mon–Sun calendar weeks. Same JSON powers the page + PDF.
					</p>
				</div>

				<div
					style={{
						display: 'flex',
						gap: 10,
						flexWrap: 'wrap',
						alignItems: 'flex-start',
					}}
				>
					<button
						className="btn btnPrimary"
						onClick={() => downloadPlanPdf(plan)}
					>
						Download PDF
					</button>
				</div>
			</div>

			<div style={{ marginTop: 16 }}>
				<PlanRenderer plan={plan} />
			</div>
		</section>
	);
}
