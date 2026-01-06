'use client';

import { useState } from 'react';
import Link from 'next/link';
import PlanRenderer from '@/components/PlanRenderer/PlanRenderer';
import { downloadPlanPdf } from '@/lib/pdf/downloadPlanPdf';
import styles from './page.module.scss';

const STATUS_COPY = {
	loading: {
		label: 'Generating plan',
		headline: 'Hold tight',
		body: 'We are stitching together your selections so you can review the full block.',
	},
	missing: {
		label: 'Missing selections',
		headline: 'Need your inputs',
		body: 'Return to the builder, dial in your knobs, and run it again.',
	},
	error: {
		label: 'Issue generating plan',
		headline: 'We hit a snag',
		body: 'Please head back to the builder and try once more.',
	},
};

export default function PreviewClient({
	selection,
	plan,
	errorMessage = '',
	isLoading = false,
}) {
	const [copyState, setCopyState] = useState('idle');

	const generatedAt = plan?.generatedAt
		? new Date(plan.generatedAt).toLocaleString(undefined, {
				dateStyle: 'medium',
				timeStyle: 'short',
		  })
		: null;

	const summaryItems = selection
		? [
				{ label: 'Goal', value: selection.display.goal.label },
				{ label: 'Hours/week', value: selection.display.hoursLabel },
				{
					label: 'Week structure',
					value: selection.display.structureLabel,
				},
				{ label: 'Experience', value: selection.display.experienceLabel },
				{ label: 'Block length', value: selection.display.blockLabel },
				{ label: 'Shift-work mode', value: selection.display.shiftLabel },
		  ]
		: [];

	const status = !selection
		? 'missing'
		: errorMessage
		? 'error'
		: plan
		? 'ready'
		: isLoading
		? 'loading'
		: 'loading';

	const isReady = status === 'ready' && Boolean(plan);
	const backHref = selection?.backHref || '/free-plan';
	const statusCopy = STATUS_COPY[status] || STATUS_COPY.error;

	async function copySummary() {
		if (!selection) return;
		try {
			await navigator.clipboard.writeText(selection.summaryText);
			setCopyState('copied');
			setTimeout(() => setCopyState('idle'), 2000);
		} catch (err) {
			console.error(err);
			setCopyState('error');
		}
	}

	function handleDownloadPdf() {
		if (!plan) return;
		downloadPlanPdf({
			...plan,
			selection: plan.selection || selection?.normalized,
		});
	}

	return (
		<div className={styles.wrapper}>
			<Link href={backHref} className={styles.backLink}>
				<span aria-hidden="true">←</span> Back to builder
			</Link>

			<section className={`card ${styles.heroCard}`}>
				{isReady && selection ? (
					<>
						<div className={styles.heroHeader}>
							<p className="eyebrow">{selection.display.goal.label}</p>
							<h1 className="h1">Plan preview</h1>
							<p>{selection.display.goal.description}</p>
						</div>
						<div className={styles.heroMeta}>
							<span className={styles.badge}>
								{selection.display.hoursLabel} / week
							</span>
							{generatedAt && (
								<span className={styles.timestamp}>
									Generated {generatedAt}
								</span>
							)}
						</div>
						<div className={styles.heroActions}>
							<button
								type="button"
								className="btn"
								onClick={handleDownloadPdf}
							>
								Download PDF
							</button>
							<button
								type="button"
								className="btn"
								onClick={copySummary}
							>
								Copy plan summary
							</button>
							<Link href={backHref} className="btn">
								Adjust selections
							</Link>
						</div>
						{copyState !== 'idle' && (
							<span className={styles.copyStatus}>
								{copyState === 'copied'
									? 'Summary copied to clipboard'
									: 'Unable to copy summary'}
							</span>
						)}
					</>
				) : (
					<div className={styles.statusMessage}>
						<p className="eyebrow">{statusCopy.label}</p>
						<h2>{statusCopy.headline}</h2>
						<p>{errorMessage || statusCopy.body}</p>
						<div className={styles.actionsRow}>
							<Link href={backHref} className="btn">
								Back to builder
							</Link>
						</div>
					</div>
				)}
			</section>

			{isReady && selection && (
				<>
					<section className={`card ${styles.section}`}>
						<h3>Plan summary</h3>
						<div className={styles.metaGrid}>
							{summaryItems.map((item) => (
								<div key={item.label} className={styles.metaItem}>
									<span>{item.label}</span>
									<strong>{item.value}</strong>
								</div>
							))}
						</div>
					</section>

					<section className={`card ${styles.section}`}>
						<div className={styles.sectionHeaderRow}>
							<h3>Block progression</h3>
							<button
								type="button"
								className="btn"
								onClick={handleDownloadPdf}
							>
								Download PDF
							</button>
						</div>
						<PlanRenderer plan={plan} />
					</section>
				</>
			)}
		</div>
	);
}
