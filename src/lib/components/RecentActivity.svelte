<script lang="ts">
	const recentActivities = [
		{
			quizName: "Svelte Basics",
			dueDate: "2025-07-10",
			questionCount: 15,
			accuracy: 87,
			image: "https://picsum.photos/seed/svelte/400/200"
		},
		{
			quizName: "Advanced JavaScript",
			dueDate: "2025-06-20",
			questionCount: 25,
			accuracy: 65,
			image: "https://picsum.photos/seed/js/400/200"
		},
		{
			quizName: "CSS Grids and Flexbox",
			dueDate: "2025-06-12",
			questionCount: 20,
			accuracy: 25,
			image: "https://picsum.photos/seed/css/400/200"
		},
		{
			quizName: "Python for Beginners",
			dueDate: "2025-06-11",
			questionCount: 30,
			accuracy: 95,
			image: "https://picsum.photos/seed/python/400/200"
		},
		{
			quizName: "Introduction to SQL",
			dueDate: "2025-06-15",
			questionCount: 18,
			accuracy: 70,
			image: "https://picsum.photos/seed/sql/400/200"
		}
	]

	function getDaysUntilDue(dueDate: string) {
		const due = new Date(dueDate)
		const now = new Date()
		const diffTime = due.getTime() - now.getTime()
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

		if (diffDays < 0) {
			return "Past due"
		} else if (diffDays === 0) {
			return "Due today"
		} else {
			return `Due in ${diffDays} days`
		}
	}

	function getAccuracyColor(accuracy: number) {
		if (accuracy < 30) {
			return "bg-red-500"
		}
		if (accuracy < 70) {
			return "bg-yellow-500"
		}
		return "bg-green-500"
	}
</script>

<div class="recent-activity">
	<div class="mb-4 flex items-center justify-between">
		<h3 class="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
		<button class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"> Show all </button>
	</div>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
		{#each recentActivities as activity (activity.quizName)}
			<div class="overflow-hidden rounded-lg bg-white shadow-md transition-transform duration-300 hover:scale-105 dark:bg-gray-800">
				<div class="h-32">
					<img class="h-full w-full object-cover" src={activity.image} alt="Quiz thumbnail for {activity.quizName}" />
				</div>
				<div class="p-3">
					<h4 class="text-md mb-1 font-semibold text-gray-900 dark:text-white">{activity.quizName}</h4>
					<div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
						<p><strong>Due:</strong> {getDaysUntilDue(activity.dueDate)}</p>
						<p><strong>Questions:</strong> {activity.questionCount}</p>
						<div>
							<div class="flex justify-between">
								<span class="font-semibold">Accuracy</span>
								<span>{activity.accuracy}%</span>
							</div>
							<div class="mt-1 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
								<div class="h-2.5 rounded-full {getAccuracyColor(activity.accuracy)}" style="width: {activity.accuracy}%"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
