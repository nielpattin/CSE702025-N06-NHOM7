<script lang="ts">
	import type { PageData } from "../$types"

	let { quiz } = $props<{ quiz: PageData["quiz"] }>()

	function getDifficultyBadgeClass(difficulty: string | null) {
		switch (difficulty?.toLowerCase()) {
			case "easy":
				return "bg-green-900/30 text-green-200"
			case "medium":
				return "bg-yellow-900/30 text-yellow-200"
			case "hard":
				return "bg-red-900/30 text-red-200"
			default:
				return "bg-gray-900/30 text-gray-200"
		}
	}

	function getVisibilityBadgeClass(visibility: string | null) {
		switch (visibility?.toLowerCase()) {
			case "public":
				return "bg-blue-900/30 text-blue-200"
			case "private":
				return "bg-gray-900/30 text-gray-200"
			case "unlisted":
				return "bg-purple-900/30 text-purple-200"
			default:
				return "bg-gray-900/30 text-gray-200"
		}
	}

	function getStatusBadgeClass(status: string | null) {
		switch (status?.toLowerCase()) {
			case "published":
				return "bg-green-900/30 text-green-200"
			case "draft":
				return "bg-yellow-900/30 text-yellow-200"
			case "archived":
				return "bg-gray-900/30 text-gray-200"
			default:
				return "bg-gray-900/30 text-gray-200"
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
