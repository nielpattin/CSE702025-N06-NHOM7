<script lang="ts">
	import { getAccuracyColor, formatDate } from "./utils"
	import type { PageData } from "../$types"
	import { Calendar } from "@lucide/svelte"

	type SessionReport = PageData["sessionReports"][0]

	let { report }: { report: SessionReport } = $props()
</script>

<div class="block cursor-pointer rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg transition-transform hover:scale-105">
	<a href="/reports/{report.id}/players">
		<h3 class="mb-3 text-lg font-semibold text-white">{report.sessionName}</h3>

		<div class="mb-4 flex items-center text-sm text-gray-400">
			<Calendar class="mr-2 h-4 w-4" />
			Created: {formatDate(report.createdDate)}
		</div>

		<div class="flex items-center justify-between border-t border-gray-700 pt-4">
			<div class="text-sm text-gray-400">
				<span class="font-medium text-white">{report.participantCount}</span> participants
			</div>
			<div class="text-sm">
				<span class="text-gray-400">Avg. Accuracy: </span>
				<span class="font-bold {getAccuracyColor(report.accuracy)}">{report.accuracy}%</span>
			</div>
		</div>
	</a>
</div>
