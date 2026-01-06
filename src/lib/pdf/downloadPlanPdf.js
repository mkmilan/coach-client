import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getGoalByPlanId } from '@/data/freePlanGoals';

export function downloadPlanPdf(plan) {
	if (!plan) return;
	const doc = new jsPDF({ unit: 'pt', format: 'a4' });

	const goalId = plan.selection?.goal;
	const goalMeta = goalId ? getGoalByPlanId(goalId) : null;
	const goalLabel = goalMeta?.label || 'Generated plan';
	const title = `${goalLabel} preview`;
	doc.setFontSize(16);
	doc.text(title, 40, 50);

	doc.setFontSize(10);
	doc.text(
		`Generated: ${new Date(plan.generatedAt).toLocaleString()}`,
		40,
		68
	);

	let y = 90;

	for (const w of plan.weeks) {
		doc.setFontSize(12);
		doc.text(`Week ${w.week}${w.isDeload ? ' (Deload)' : ''}`, 40, y);
		y += 10;

		const rows = (w.days || []).map((d) => [
			d.day,
			(d.workout?.sport || '').toUpperCase(),
			d.workout?.title || '',
			`${d.workout?.minutes || ''} min`,
			d.workout?.intensity || '',
		]);

		autoTable(doc, {
			startY: y + 6,
			head: [['Day', 'Sport', 'Session', 'Duration', 'Intensity']],
			body: rows,
			margin: { left: 40, right: 40 },
			styles: { fontSize: 9, cellPadding: 4 },
			headStyles: { fontSize: 9 },
		});

		y = doc.lastAutoTable.finalY + 18;

		if (y > 740) {
			doc.addPage();
			y = 50;
		}
	}

	const filename = plan.id || goalMeta?.slug || 'plan-preview';
	doc.save(`${filename}.pdf`);
}
