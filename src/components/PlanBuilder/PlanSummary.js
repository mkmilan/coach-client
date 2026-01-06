'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PlanSummary.module.scss';

function toQuery(selection) {
	const params = new URLSearchParams();
	params.set('goal', selection.goal);
	params.set('hours', selection.hoursBucketId);
	params.set('structure', selection.structureId);
	params.set('level', selection.experience);
	params.set('weeks', String(selection.blockWeeks));
	params.set('shift', selection.shiftMode ? '1' : '0');
	return params.toString();
}

export default function PlanSummary({ selection }) {
	const router = useRouter();

	const summaryRows = useMemo(
		() => [
			['Goal', selection.goalLabel],
			['Hours/week', selection.hoursLabel],
			['Week structure', selection.structureLabel],
			['Experience', selection.experienceLabel],
			['Block length', `${selection.blockWeeks} weeks`],
			['Shift-work mode', selection.shiftMode ? 'On' : 'Off'],
		],
		[selection]
	);

	function onGenerate() {
		const qs = toQuery(selection);
		router.push(`/plans/preview?${qs}`);
	}

	async function onCopy() {
		const text = summaryRows.map(([k, v]) => `${k}: ${v}`).join('\n');
		await navigator.clipboard.writeText(text);
	}

	return (
		<div className={`card ${styles.wrap}`}>
			<div className={styles.header}>
				<div>
					<h3 className={styles.title}>Plan summary</h3>
					<p className={styles.sub}>When ready, generate the plan.</p>
				</div>
			</div>

			<div className={styles.table}>
				{summaryRows.map(([k, v]) => (
					<div key={k} className={styles.row}>
						<span className={styles.k}>{k}</span>
						<span className={styles.v}>{v}</span>
					</div>
				))}
			</div>

			<div className={styles.actions}>
				<button className="btn btnPrimary" onClick={onGenerate}>
					Generate plan
				</button>
				<button className="btn" onClick={onCopy}>
					Copy summary
				</button>
			</div>
		</div>
	);
}
