'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';
import {
	HOUR_WINDOWS,
	WEEK_STRUCTURES,
	EXPERIENCE_LEVELS,
	BLOCK_LENGTHS,
} from '@/data/freePlanOptions';
import goalProfilesData from '@/data/plans/goalProfiles.json';

function PillGroup({ options, value, onChange }) {
	return (
		<div className={styles.pillGroup}>
			{options.map((option) => {
				const isActive = value === option.value;
				return (
					<button
						key={option.value}
						type="button"
						className={
							isActive
								? `${styles.pill} ${styles.pillActive}`
								: styles.pill
						}
						onClick={() => onChange(option.value)}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}

function OptionTiles({ options, value, onChange }) {
	return (
		<div className={styles.tileList}>
			{options.map((option) => {
				const isActive = value === option.value;
				return (
					<button
						key={option.value}
						type="button"
						className={
							isActive
								? `${styles.tile} ${styles.tileActive}`
								: styles.tile
						}
						onClick={() => onChange(option.value)}
					>
						<strong>{option.label}</strong>
						<span>{option.description}</span>
					</button>
				);
			})}
		</div>
	);
}

export default function Configurator({ goal }) {
	const router = useRouter();
	const [hoursWindow, setHoursWindow] = useState(HOUR_WINDOWS[1].value);
	const [experience, setExperience] = useState(EXPERIENCE_LEVELS[1].value);
	const [blockLength, setBlockLength] = useState(BLOCK_LENGTHS[1]);
	const [shiftMode, setShiftMode] = useState(false);
	const [copyState, setCopyState] = useState('idle');

	const hoursOrder = useMemo(
		() => ['h_4_6', 'h_6_8', 'h_8_10', 'h_10_12'],
		[]
	);
	const hoursToBucketId = useMemo(
		() =>
			HOUR_WINDOWS.reduce((acc, opt) => {
				acc[opt.value] = `h_${opt.value.replace('-', '_')}`;
				return acc;
			}, {}),
		[]
	);
	const bucketToValue = useMemo(
		() =>
			HOUR_WINDOWS.reduce((acc, opt) => {
				acc[`h_${opt.value.replace('-', '_')}`] = opt.value;
				return acc;
			}, {}),
		[]
	);

	const structureOptions = useMemo(() => {
		const goalProfile = goalProfilesData?.profiles?.[goal?.planId];
		const allowed = goalProfile?.constraints?.allowedStructures;
		if (!allowed?.length) return WEEK_STRUCTURES;
		return WEEK_STRUCTURES.filter((opt) => allowed.includes(opt.value));
	}, [goal?.planId]);

	const [structure, setStructure] = useState(
		structureOptions[0]?.value || WEEK_STRUCTURES[0].value
	);

	const hourOptions = useMemo(() => {
		const goalProfile = goalProfilesData?.profiles?.[goal?.planId];
		const cap = goalProfile?.constraints?.hoursCapByStructure?.[structure];
		if (!cap) return HOUR_WINDOWS;
		const capIdx = hoursOrder.indexOf(cap);
		if (capIdx === -1) return HOUR_WINDOWS;
		return HOUR_WINDOWS.filter(
			(opt) => hoursOrder.indexOf(hoursToBucketId[opt.value]) <= capIdx
		);
	}, [goal?.planId, structure, hoursOrder, hoursToBucketId]);

	useEffect(() => {
		if (!structureOptions.length) return;
		if (!structureOptions.find((opt) => opt.value === structure)) {
			setStructure(structureOptions[0].value);
		}
	}, [structure, structureOptions]);

	useEffect(() => {
		if (!hourOptions.length) return;
		if (!hourOptions.find((opt) => opt.value === hoursWindow)) {
			const fallback = bucketToValue[hoursOrder[0]] || hourOptions[0].value;
			setHoursWindow(fallback);
		}
	}, [bucketToValue, hourOptions, hoursOrder, hoursWindow]);

	const hoursOption = HOUR_WINDOWS.find((opt) => opt.value === hoursWindow);
	const structureOption = structureOptions.find(
		(opt) => opt.value === structure
	);
	const hoursLabel = hoursOption?.label || '';
	const structureLabel = structureOption?.label || '';

	const summary = useMemo(() => {
		return `Goal: ${goal.label}
Hours/week: ${hoursLabel}
Structure: ${structureLabel}
Experience: ${experience.charAt(0).toUpperCase() + experience.slice(1)}
Block length: ${blockLength} weeks
Shift-work mode: ${shiftMode ? 'On' : 'Off'}`;
	}, [
		goal.label,
		hoursLabel,
		structureLabel,
		experience,
		blockLength,
		shiftMode,
	]);

	function handleGeneratePlan() {
		if (!goal?.slug) return;
		const params = new URLSearchParams({
			goal: goal.slug,
			hours: hoursWindow,
			structure,
			experience,
			blockLength: String(blockLength),
			shiftMode: shiftMode ? 'true' : 'false',
		});
		router.push(`/plans/preview?${params.toString()}`);
	}

	async function copySummary() {
		try {
			await navigator.clipboard.writeText(summary);
			setCopyState('copied');
			setTimeout(() => setCopyState('idle'), 2000);
		} catch (err) {
			console.error(err);
			setCopyState('error');
		}
	}

	return (
		<div className={styles.configGrid}>
			<section className={`card ${styles.section}`}>
				<div className={styles.sectionHeader}>
					<h3>Hours per week</h3>
					<p>Lead with time first. Pick the load that fits real life.</p>
				</div>
				<OptionTiles
					options={hourOptions}
					value={hoursWindow}
					onChange={setHoursWindow}
				/>
			</section>

			<section className={`card ${styles.section}`}>
				<div className={styles.sectionHeader}>
					<h3>Week structure</h3>
					<p>Use patterns to understand how the week actually flows.</p>
				</div>
				<OptionTiles
					options={structureOptions}
					value={structure}
					onChange={setStructure}
				/>
			</section>

			<section className={`card ${styles.section}`}>
				<div className={styles.sectionHeader}>
					<h3>Experience level</h3>
					<p>Adjusts progression rate + intensity density.</p>
				</div>
				<PillGroup
					options={EXPERIENCE_LEVELS}
					value={experience}
					onChange={setExperience}
				/>
			</section>

			<section className={`card ${styles.section}`}>
				<div className={styles.sectionHeader}>
					<h3>Block length</h3>
					<p>Pick the runway that fits your season.</p>
				</div>
				<PillGroup
					options={BLOCK_LENGTHS.map((value) => ({
						value,
						label: `${value} weeks`,
					}))}
					value={blockLength}
					onChange={setBlockLength}
				/>
			</section>

			<section className={`card ${styles.section}`}>
				<div className={styles.sectionHeader}>
					<h3>Extras</h3>
					<p>Toggle shift-friendly spacing for rotating schedules.</p>
				</div>
				<div className={styles.switchRow}>
					<div className={styles.switchMeta}>
						<strong>Shift-work mode</strong>
						<span>
							Reflows key days for nights, doubles, or swing shifts.
						</span>
					</div>
					<button
						type="button"
						role="switch"
						aria-checked={shiftMode}
						className={
							shiftMode
								? `${styles.switchButton} ${styles.switchButtonActive}`
								: styles.switchButton
						}
						onClick={() => setShiftMode((prev) => !prev)}
					>
						<span className={styles.switchTrack}>
							<span className={styles.switchThumb} />
						</span>
						<span className={styles.switchState}>
							{shiftMode ? 'On' : 'Off'}
						</span>
					</button>
				</div>
			</section>

			<section className={`card ${styles.section} ${styles.summarySection}`}>
				<div className={styles.sectionHeader}>
					<h3>Plan summary</h3>
					<p>
						Review your picks, then generate a preview or keep the text.
					</p>
				</div>
				<ul className={styles.summaryList}>
					<li>
						<strong>Goal</strong>
						<span>{goal.label}</span>
					</li>
					<li>
						<strong>Hours/week</strong>
						<span>{hoursLabel}</span>
					</li>
					<li>
						<strong>Week structure</strong>
						<span>{structureLabel}</span>
					</li>
					<li>
						<strong>Experience</strong>
						<span>
							{experience.charAt(0).toUpperCase() + experience.slice(1)}
						</span>
					</li>
					<li>
						<strong>Block length</strong>
						<span>{blockLength} weeks</span>
					</li>
					<li>
						<strong>Shift-work mode</strong>
						<span>{shiftMode ? 'On' : 'Off'}</span>
					</li>
				</ul>

				<div className={styles.summaryActions}>
					<button
						type="button"
						className="btn"
						onClick={handleGeneratePlan}
					>
						Generate plan
					</button>
				</div>
			</section>
		</div>
	);
}
