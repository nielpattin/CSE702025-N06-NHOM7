<script lang="ts">
	import type { PageData } from "../$types"

	let { quiz } = $props<{ quiz: PageData["quiz"] }>()

	function formatDuration(minutes: number | null) {
		if (!minutes || minutes === 0) return "Unlimited"
		if (minutes < 60) return `${minutes} min`
		const hours = Math.floor(minutes / 60)
		const remainingMinutes = minutes % 60
		if (remainingMinutes === 0) return `${hours} hr`
		return `${hours} hr ${remainingMinutes} min`
	}
</script>

<div class="flex flex-wrap justify-end gap-4 text-sm">
	<div class="flex items-center gap-1">
		<span class="text-foreground font-medium">
			{quiz.participants?.toLocaleString() || 0}
		</span>
		<span class="text-muted-foreground">Participants</span>
	</div>

	<div class="flex items-center gap-1">
		<span class="text-foreground font-medium">
			{formatDuration(quiz.duration)}
		</span>
		<span class="text-muted-foreground">Duration</span>
	</div>
</div>
