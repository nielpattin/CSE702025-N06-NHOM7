<script lang="ts">
	import { ShareNodesOutline, EditOutline, PlayOutline } from "flowbite-svelte-icons"
	import { enhance } from "$app/forms"
	import type { PageData } from "../$types"

	let { quiz, isOwner } = $props<{ quiz: PageData["quiz"]; isOwner: PageData["isOwner"] }>()
</script>

<div class="flex justify-end">
	<div class="flex gap-3 overflow-x-auto">
		<button class="inline-flex cursor-pointer items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-base font-medium text-gray-300 transition-colors hover:bg-gray-600 hover:text-white">
			<ShareNodesOutline class="h-4 w-4" />
			Share
		</button>

		{#if isOwner}
			<a href="/quiz/edit/{quiz.id}" class="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-base font-medium text-gray-300 transition-colors hover:bg-gray-600 hover:text-white">
				<EditOutline class="h-4 w-4" />
				Edit
			</a>
		{/if}

		<form id="startSessionForm" method="POST" action="?/startSession" use:enhance style="display: inline;">
			<input type="hidden" name="quizId" value={quiz.id} />
			<button type="submit" class="inline-flex cursor-pointer items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-base font-medium text-gray-300 transition-colors hover:bg-gray-600 hover:text-white">
				<PlayOutline class="h-4 w-4" />
				Start
			</button>
		</form>
	</div>
</div>
