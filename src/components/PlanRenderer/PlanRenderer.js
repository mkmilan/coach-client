import styles from "./PlanRenderer.module.scss";

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function normalizeDays(days) {
	return (days || []).map((d) => {
		if (Array.isArray(d.sessions)) return d;
		if (d.workout) {
			return {
				...d,
				sessions: [
					{
						...d.workout,
						timeOfDay: d.timeOfDay || "",
					},
				],
			};
		}
		return { ...d, sessions: [] };
	});
}

function sortDays(days) {
	const normalized = normalizeDays(days);
	const map = new Map(normalized.map((d) => [d.day, d]));
	return DAY_ORDER.map((day) => map.get(day)).filter(Boolean);
}

function formatWorkoutDetails(details) {
	if (!details || typeof details !== "object") return "";
	const parts = [];
	const { sets, reps, workMin, restMin, work, restSec } = details;
	if (sets != null) {
		const count = Number(sets);
		if (!Number.isNaN(count)) parts.push(`${count} ${count === 1 ? "set" : "sets"}`);
	}
	if (reps != null) {
		const count = Number(reps);
		if (!Number.isNaN(count)) parts.push(`${count} ${count === 1 ? "rep" : "reps"}`);
	}
	if (workMin != null) {
		const minutes = Number(workMin);
		if (!Number.isNaN(minutes)) parts.push(`${minutes} min on`);
	}
	if (work != null) {
		parts.push(`${work} on`);
	}
	if (restMin != null) {
		const minutes = Number(restMin);
		if (!Number.isNaN(minutes)) parts.push(`${minutes} min easy`);
	}
	if (restSec != null) {
		const seconds = Number(restSec);
		if (!Number.isNaN(seconds)) parts.push(`${seconds}s easy`);
	}
	return parts.join(" · ");
}

function phaseLabel(phase) {
	if (phase === "race_week") return "Race week";
	if (phase === "taper") return "Taper";
	return null;
}

export default function PlanRenderer({ plan }) {
	return (
		<div className={styles.wrap}>
			{plan.warnings?.length ? (
				<div className={`card ${styles.warningBox}`}>
					<b>Notes</b>
					<ul className={styles.warningList}>
						{plan.warnings.map((w) => (
							<li key={w}>{w}</li>
						))}
					</ul>
				</div>
			) : null}

			{plan.weeks.map((w) => {
				const label = phaseLabel(w.phase);

				return (
					<div key={w.week} className={`card ${styles.week}`}>
						<div className={styles.weekHeader}>
							<div>
								<div className={styles.weekTitle}>
									Week {w.week}
									{label ? <span className={styles.phase}>{label}</span> : null}
									{w.isDeload && w.phase !== "race_week" ? <span className={styles.deload}>Deload</span> : null}
								</div>
								<div className="small">Mon–Sun schedule</div>
							</div>
						</div>

						<div className={styles.grid}>
							{sortDays(w.days).map((d) => {
								const hasMultiple = d.sessions.length > 1;

								return (
									<div key={d.day} className={`card ${styles.day} ${d.isKey ? styles.key : ""}`}>
										<div className={styles.dayTop}>
											<b>{d.day}</b>
											<span className="small">{hasMultiple ? "MULTI" : (d.sessions[0]?.sport || "").toUpperCase()}</span>
										</div>

										{d.sessions.map((s, idx) => {
											const detailText = formatWorkoutDetails(s.details);
											const timeTag = s.timeOfDay ? `${s.timeOfDay.toUpperCase()} · ` : "";
											return (
												<div key={`${d.day}-${idx}`} style={{ marginTop: idx === 0 ? 0 : 10 }}>
													<div className={styles.title}>{timeTag}{s.title}</div>
													<div className="small">
														{s.minutes == null ? "—" : `${s.minutes} min`} · {s.intensity}
													</div>
													{detailText ? (
														<div className="small" style={{ marginTop: 6 }}>
															{detailText}
														</div>
													) : null}
													<p className={styles.notes}>{s.notes}</p>
												</div>
											);
										})}
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}
