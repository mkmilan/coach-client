'use client';

import { useMemo, useState } from 'react';
import styles from './page.module.scss';

const HOUR_WINDOWS = [
	{
		value: '4-6',
		label: '4–6h',
		description:
			'Two key sessions + two easy fillers. Sustainable base building.',
	},
	{
		value: '6-8',
		label: '6–8h',
		description: 'Add one more quality slot and extend the weekend long run.',
	},
	{
		value: '8-10',
		label: '8–10h',
		description:
			'Full spectrum: intensity, strength endurance, and long aerobic days.',
	},
	{
		value: '10-12',
		label: '10–12h',
		description: 'High-volume focus. Doubles + cross-training ready.',
	},
];

const WEEK_STRUCTURES = [
	{
		value: '3-key-2-easy',
		label: '3 key + 2 easy',
		description:
			'Tuesday/Thursday quality + weekend long run, with two easy floaters.',
	},
	{
		value: '2-quality-long',
		label: '2 quality + long',
		description:
			'One threshold, one speed, long run focus. Lighter weekly stress.',
	},
	{
		value: 'consistency',
		label: 'Low freq / high consistency',
		description:
			'Shorter daily work, optional doubles, blends endurance + strength.',
	},
];

const EXPERIENCE_LEVELS = [
	{ value: 'new', label: 'New' },
	{ value: 'intermediate', label: 'Intermediate' },
	{ value: 'advanced', label: 'Advanced' },
];

const BLOCK_LENGTHS = [8, 12, 16];

const EXTRAS = [
	{ value: 'bikeStrength', label: 'Bike / swim strength focus' },
	{ value: 'shiftMode', label: 'Shift-work mode' },
];

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
	const [hoursWindow, setHoursWindow] = useState(HOUR_WINDOWS[1].value);
	const [structure, setStructure] = useState(WEEK_STRUCTURES[0].value);
	const [experience, setExperience] = useState(EXPERIENCE_LEVELS[1].value);
	const [blockLength, setBlockLength] = useState(BLOCK_LENGTHS[1]);
	const [extras, setExtras] = useState(() => new Set());
	const [copyState, setCopyState] = useState('idle');

	const hoursOption = HOUR_WINDOWS.find((opt) => opt.value === hoursWindow);
	const structureOption = WEEK_STRUCTURES.find(
		(opt) => opt.value === structure
	);
	const hoursLabel = hoursOption?.label || '';
	const structureLabel = structureOption?.label || '';

	const extrasList = EXTRAS.filter((extra) => extras.has(extra.value)).map(
		(extra) => extra.label
	);

	const summary = useMemo(() => {
		return `Goal: ${
			goal.label
		}\nHours/week: ${hoursLabel}\nStructure: ${structureLabel}\nExperience: ${
			experience.charAt(0).toUpperCase() + experience.slice(1)
		}\nBlock length: ${blockLength} weeks\nExtras: ${
			extrasList.length ? extrasList.join(', ') : 'None'
		}`;
	}, [
		goal.label,
		hoursLabel,
		structureLabel,
		experience,
		blockLength,
		extrasList,
	]);

	function toggleExtra(value) {
		setExtras((prev) => {
			const next = new Set(prev);
			if (next.has(value)) {
				next.delete(value);
			} else {
				next.add(value);
			}
			return next;
		});
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
					options={HOUR_WINDOWS}
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
					options={WEEK_STRUCTURES}
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
					<p>Layer supporting focus areas if needed.</p>
				</div>
				<div className={styles.toggleGrid}>
					{EXTRAS.map((extra) => {
						const isActive = extras.has(extra.value);
						return (
							<button
								key={extra.value}
								type="button"
								className={
									isActive
										? `${styles.toggle} ${styles.toggleActive}`
										: styles.toggle
								}
								onClick={() => toggleExtra(extra.value)}
							>
								{extra.label}
							</button>
						);
					})}
				</div>
			</section>

			<section className={`card ${styles.section} ${styles.summarySection}`}>
				<div className={styles.sectionHeader}>
					<h3>Plan summary</h3>
					<p>Save this snapshot or copy it for your notes.</p>
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
						<strong>Extras</strong>
						<span>
							{extrasList.length ? extrasList.join(', ') : 'None'}
						</span>
					</li>
				</ul>

				<button type="button" className="btn" onClick={copySummary}>
					Copy summary
				</button>
				{copyState !== 'idle' && (
					<p className={styles.copyStatus} data-state={copyState}>
						{copyState === 'copied'
							? 'Copied to clipboard.'
							: 'Clipboard not available.'}
					</p>
				)}
			</section>
		</div>
	);
}
