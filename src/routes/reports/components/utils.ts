export function getAccuracyColor(accuracy: number): string {
	if (accuracy >= 85) return "text-green-400"
	if (accuracy >= 75) return "text-yellow-400"
	return "text-red-400"
}

export function formatDate(date: Date | string | null): string {
	if (!date) return "Unknown date"
	const dateObj = date instanceof Date ? date : new Date(date)
	return dateObj.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric"
	})
}
