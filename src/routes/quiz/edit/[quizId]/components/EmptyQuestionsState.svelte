<script lang="ts">
	import { Button } from "$lib/components/ui/button"
	import { Plus, HelpCircle } from "@lucide/svelte"

	let { quizId } = $props<{
		quizId: number
	}>()
</script>

<div class="border-muted-foreground/25 rounded-lg border-2 border-dashed p-8 text-center">
	<div class="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
		<HelpCircle class="text-muted-foreground h-6 w-6" />
	</div>
	<h3 class="text-xl font-semibold">No questions yet</h3>
	<p class="text-muted-foreground mt-2">Get started by adding your first question to this quiz.</p>
	<div class="mt-6">
		<Button href="/quiz/edit/{quizId}/question/new" class="gap-2">
			<Plus class="h-4 w-4" />
			Add Your First Question
		</Button>
	</div>
</div>
