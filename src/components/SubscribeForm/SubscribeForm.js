'use client';

import { useState } from 'react';
import styles from './SubscribeForm.module.scss';

export default function SubscribeForm({ source = 'free-plan' }) {
	const [email, setEmail] = useState('');
	const [name, setName] = useState('');
	const [status, setStatus] = useState({ state: 'idle', msg: '' });

	async function onSubmit(e) {
		e.preventDefault();
		setStatus({ state: 'loading', msg: '' });

		try {
			const res = await fetch('/api/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, name, source }),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data?.error || 'Something went wrong.');

			setStatus({
				state: 'success',
				msg: 'Sent! Check your email in a minute.',
			});
			setEmail('');
			setName('');
		} catch (err) {
			setStatus({
				state: 'error',
				msg: err.message || 'Failed. Try again.',
			});
		}
	}

	return (
		<form className={styles.form} onSubmit={onSubmit}>
			<div className={styles.row}>
				<label>
					<span className={styles.label}>Name (optional)</span>
					<input
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Milan"
					/>
				</label>
				<label>
					<span className={styles.label}>Email</span>
					<input
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="you@email.com"
						required
						type="email"
					/>
				</label>
			</div>

			<button
				className="btn btnPrimary"
				disabled={status.state === 'loading'}
			>
				{status.state === 'loading' ? 'Sending...' : 'Get the free plan'}
			</button>

			{status.state !== 'idle' && (
				<p className={styles.status} data-state={status.state}>
					{status.msg}
				</p>
			)}

			<p className="small" style={{ marginTop: 10 }}>
				No spam. Just the plan + a short email series with practical
				training guidance.
			</p>
		</form>
	);
}
