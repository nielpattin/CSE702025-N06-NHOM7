<script lang="ts">
	import { Button } from "$lib/components/ui/button"
	import { Plus } from "@lucide/svelte"

	let { quizId } = $props<{
		quizId: number
	}>()
</script>

<Button href="/quiz/edit/{quizId}/question/new" class="gap-2">
	<Plus class="h-4 w-4" />
	Add Question
</Button>
