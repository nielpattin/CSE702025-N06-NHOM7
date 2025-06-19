<script lang="ts">
	import { formatDate } from "./utils"
	import type { PageData } from "../$types"
	import { Calendar, Users, Activity } from "@lucide/svelte"
	import { Badge } from "$lib/components/ui/badge"
	import * as Card from "$lib/components/ui/card"

	type SessionReport = PageData["sessionReports"][0]

	let { report }: { report: SessionReport } = $props()

	function getStatusColor(status: string) {
		switch (status) {
			case "completed":
				return "default"
			case "active":
				return "secondary"
			case "deleting":
				return "destructive"
			default:
				return "outline"
		}
	}
</script>

<a href="/reports/{report.id}/players" class="block transition-transform hover:scale-105">
	<Card.Root class="h-full py-3">
		<div class="space-y-3 px-4">
			<div class="grid grid-cols-[1fr_auto] items-start gap-2">
				<h3 class="dark:text-foreground truncate text-base font-semibold text-gray-900" title={report.sessionName}>
					{report.sessionName}
				</h3>
				<Badge variant={getStatusColor(report.status)} class="text-xs capitalize">
					{report.status}
				</Badge>
			</div>

			<div class="dark:text-muted-foreground flex items-center text-sm text-gray-700">
				<Calendar class="mr-2 h-4 w-4" />
				Created: {formatDate(report.createdDate)}
			</div>

			<div class="dark:text-muted-foreground flex items-center gap-4 text-sm text-gray-700">
				<div class="flex items-center">
					<Users class="mr-1 h-4 w-4" />
					<span class="font-medium">{report.participantCount}</span>
					<span class="ml-1">participant{report.participantCount === 1 ? "" : "s"}</span>
				</div>
				<div class="flex items-center">
					<Activity class="mr-1 h-4 w-4" />
					<span>Report</span>
				</div>
			</div>
		</div>
	</Card.Root>
</a>
