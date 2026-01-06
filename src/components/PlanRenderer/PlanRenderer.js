import styles from './PlanRenderer.module.scss';

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DETAIL_LABELS = {
	sets: 'Sets',
	reps: 'Reps',
	workMin: 'Work',
	restMin: 'Rest',
	workSec: 'Work',
	restSec: 'Rest',
};

function sortDays(days) {
	const map = new Map(days.map((d) => [d.day, d]));
	return DAY_ORDER.map((day) => map.get(day)).filter(Boolean);
}

function humanizeLabel(key) {
	if (DETAIL_LABELS[key]) return DETAIL_LABELS[key];
	return key
		.replace(/([A-Z])/g, ' $1')
		.replace(/^./, (char) => char.toUpperCase());
}

function formatDetailValue(key, value) {
	if (value === undefined || value === null) return null;
	const lower = key.toLowerCase();
	if (typeof value === 'number') {
		if (lower.includes('min')) return `${value} min`;
		if (lower.includes('sec')) return `${value} sec`;
	}
	return value;
}

function buildDetailEntries(details) {
	if (!details || typeof details !== 'object') return null;
	const entries = [];
	Object.entries(details).forEach(([key, value]) => {
		if (value === undefined || value === null || value === '') return;
		if (typeof value === 'object') return;
		const formattedValue = formatDetailValue(key, value);
		if (formattedValue === null) return;
		entries.push({
			label: humanizeLabel(key),
			value: formattedValue,
			id: `${key}-${value}`,
		});
	});
	return entries.length ? entries : null;
}

export default function PlanRenderer({ plan }) {
	return (
		<div className={styles.wrap}>
			{plan.weeks.map((w) => (
				<div key={w.week} className={`card ${styles.week}`}>
					<div className={styles.weekHeader}>
						<div>
							<div className={styles.weekTitle}>
								Week {w.week}{' '}
								{w.isDeload ? (
									<span className={styles.deload}>Deload</span>
								) : null}
							</div>
							<div className="small">Mon–Sun schedule</div>
						</div>
					</div>

					<div className={styles.grid}>
						{sortDays(w.days).map((d) => {
							const detailEntries = buildDetailEntries(
								d.workout.details
							);
							return (
								<div
									key={d.day}
									className={`card ${styles.day} ${
										d.isKey ? styles.key : ''
									}`}
								>
									<div className={styles.dayTop}>
										<b>{d.day}</b>
										<span className="small">
											{d.workout.sport.toUpperCase()}
										</span>
									</div>
									<div className={styles.title}>{d.workout.title}</div>
									<div className="small">
										{d.workout.minutes} min · {d.workout.intensity}
									</div>
									{detailEntries ? (
										<ul className={styles.detailList}>
											{detailEntries.map((detail) => (
												<li key={detail.id}>
													<strong>{detail.label}</strong>
													<span>{detail.value}</span>
												</li>
											))}
										</ul>
									) : null}
									<p className={styles.notes}>{d.workout.notes}</p>
								</div>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
}
