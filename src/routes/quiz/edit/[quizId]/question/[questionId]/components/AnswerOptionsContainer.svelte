<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card"
	import { ListChecks } from "@lucide/svelte"
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

<Card>
	<CardHeader>
		<CardTitle class="flex items-center gap-2">
			<ListChecks class="h-5 w-5" />
			Answer Options
		</CardTitle>
		<CardDescription>
			{#if questionType === "multiple_choice"}
				Configure the answer choices for your multiple choice question. Mark the correct answer(s).
			{:else}
				Set the correct answer for your true/false question.
			{/if}
		</CardDescription>
	</CardHeader>
	<CardContent class="flex w-full flex-row gap-4">
		{#if questionType === "multiple_choice"}
			<MultipleChoiceOptions {options} {onOptionsChange} class="w-full" />
		{:else if questionType === "true_false"}
			<TrueFalseOptions {options} {onOptionsChange} class="w-full" />
		{/if}
	</CardContent>
</Card>
