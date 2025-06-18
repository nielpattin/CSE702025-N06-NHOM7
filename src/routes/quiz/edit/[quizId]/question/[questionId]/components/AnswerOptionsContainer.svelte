<script lang="ts">
	import MultipleChoiceOptions from "./MultipleChoiceOptions.svelte"
	import TrueFalseOptions from "./TrueFalseOptions.svelte"

	type QuestionOption = {
		id?: number
		content: string
		correct: boolean
	}

	let { questionType, options, onOptionsChange } = $props<{
		questionType: "multiple_choice" | "true_false"
		options: QuestionOption[]
		onOptionsChange: (options: QuestionOption[]) => void
	}>()
</script>

<div class="border-border bg-secondary rounded-lg border p-6 shadow-lg">
	<h2 class="border-border mb-6 border-b pb-3 text-2xl font-bold text-white">Answer Options</h2>
	<div class="space-y-4">
		{#if questionType === "multiple_choice"}
			<MultipleChoiceOptions {options} {onOptionsChange} />
		{:else if questionType === "true_false"}
			<TrueFalseOptions {options} {onOptionsChange} />
		{/if}
	</div>
</div>
