<script lang="ts">
	import { ShareNodesOutline, EditOutline, PlayOutline } from "flowbite-svelte-icons"
	import { enhance } from "$app/forms"
	import type { PageData } from "../$types"

	let { quiz, isOwner } = $props<{ quiz: PageData["quiz"]; isOwner: PageData["isOwner"] }>()
</script>

<div class="flex justify-end">
	<div class="flex gap-3 overflow-x-auto">
		<button class="bg-muted hover:bg-muted text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-base font-medium transition-colors">
			<ShareNodesOutline class="h-4 w-4" />
			Share
		</button>

		{#if isOwner}
			<a href="/quiz/edit/{quiz.id}" class="bg-muted hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-base font-medium transition-colors">
				<EditOutline class="h-4 w-4" />
				Edit
			</a>
		{/if}

		<form id="startSessionForm" method="POST" action="?/startSession" use:enhance style="display: inline;">
			<input type="hidden" name="quizId" value={quiz.id} />
			<button type="submit" class="bg-muted hover:bg-muted text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-base font-medium transition-colors">
				<PlayOutline class="h-4 w-4" />
				Start
			</button>
		</form>
	</div>
</div>
