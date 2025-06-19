<script lang="ts">
	import type { PageData } from "../$types"

	let { quiz } = $props<{ quiz: PageData["quiz"] }>()

	function getDifficultyBadgeClass(difficulty: string | null) {
		switch (difficulty?.toLowerCase()) {
			case "easy":
				return "bg-green-500/20 text-foreground"
			case "medium":
				return "bg-yellow-500/20 text-foreground"
			case "hard":
				return "bg-red-500/20 text-foreground"
			default:
				return "bg-muted text-foreground"
		}
	}

	function getVisibilityBadgeClass(visibility: string | null) {
		switch (visibility?.toLowerCase()) {
			case "public":
				return "bg-blue-500/20 text-foreground"
			case "private":
				return "bg-muted text-foreground"
			case "unlisted":
				return "bg-purple-500/20 text-foreground"
			default:
				return "bg-muted text-foreground"
		}
	}

	function getStatusBadgeClass(status: string | null) {
		switch (status?.toLowerCase()) {
			case "published":
				return "bg-green-500/20 text-foreground"
			case "draft":
				return "bg-yellow-500/20 text-foreground"
			case "archived":
				return "bg-muted text-foreground"
			default:
				return "bg-muted text-foreground"
		}
	}
</script>

<div class="flex flex-wrap justify-end gap-2">
	<span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-normal capitalize {getDifficultyBadgeClass(quiz.difficulty)}">
		{quiz.difficulty || "Unknown"}
	</span>
	<span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-normal capitalize {getVisibilityBadgeClass(quiz.visibility)}">
		{quiz.visibility || "Private"}
	</span>
	<span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-normal capitalize {getStatusBadgeClass(quiz.status)}">
		{quiz.status || "Draft"}
	</span>
</div>
