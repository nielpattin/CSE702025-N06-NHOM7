<script lang="ts">
	import ReportCard from "./ReportCard.svelte"
	import type { PageData } from "../$types"

	let { reports }: { reports: PageData["sessionReports"] } = $props()
</script>

<div class="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
	{#each reports as report (report.id)}
		<ReportCard {report} />
	{/each}
</div>
