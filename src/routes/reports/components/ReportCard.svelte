<script lang="ts">
	import { formatDate } from "./utils"
	import type { PageData } from "../$types"
	import { Calendar } from "@lucide/svelte"

	type SessionReport = PageData["sessionReports"][0]

	let { report }: { report: SessionReport } = $props()
</script>

<div class="block cursor-pointer rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg transition-transform hover:scale-105">
	<a href="/reports/{report.id}/players">
		<div class="min-w-0 flex-1">
			<h3 class="mb-3 truncate text-lg font-semibold text-white" title={report.sessionName}>
				{report.sessionName}
			</h3>

			<div class="mb-4 flex items-center text-sm text-gray-400">
				<Calendar class="mr-2 h-4 w-4 flex-shrink-0" />
				<span class="truncate">Created: {formatDate(report.createdDate)}</span>
			</div>

			<div class="flex items-center justify-between border-t border-gray-700 pt-4">
				<div class="text-sm text-gray-400">
					<span class="font-medium text-white">{report.participantCount}</span> participant{report.participantCount === 1 ? "" : "s"}
				</div>
			</div>
		</div>
	</a>
</div>
