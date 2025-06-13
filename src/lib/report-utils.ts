export function getAccuracyStrokeColor(percentage: number) {
	if (percentage >= 75) return "#34d399" // green-400
	if (percentage >= 50) return "#fbbf24" // yellow-400
	return "#f87171" // red-400
}
