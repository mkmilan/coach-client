import { generateRunPlan } from "@/lib/generators/runGenerator";
import { generateTriPlan } from "@/lib/generators/triGenerator";

export function generatePlan(selection) {
	const goal = selection?.goal;
	if (!goal) throw new Error("Missing plan goal.");

	if (goal === "70.3" || goal === "ironman") {
		return generateTriPlan(selection);
	}
	return generateRunPlan(selection);
}
