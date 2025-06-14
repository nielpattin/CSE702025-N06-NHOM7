<script lang="ts">
	import AnswerOption from "./AnswerOption.svelte"

	type QuestionOption = {
		id?: number
		content: string
		correct: boolean
	}

	let { options, onOptionsChange } = $props<{
		options: QuestionOption[]
		onOptionsChange: (options: QuestionOption[]) => void
	}>()

	function updateOption(index: number, updatedOption: Partial<QuestionOption>) {
		const newOptions = options.map((option: QuestionOption, i: number) => (i === index ? { ...option, ...updatedOption } : option))
		onOptionsChange(newOptions)
	}

	function removeOption(index: number) {
		const newOptions = options.filter((_: QuestionOption, i: number) => i !== index)
		onOptionsChange(newOptions)
	}

	function addOption() {
		const newOptions = [...options, { content: "", correct: false }]
		onOptionsChange(newOptions)
	}
</script>

<div class="space-y-4">
	{#each options as option, index (index)}
		<AnswerOption {option} {index} canRemove={options.length > 2} onContentChange={(content) => updateOption(index, { content })} onCorrectChange={(correct) => updateOption(index, { correct })} onRemove={() => removeOption(index)} />
	{/each}

	<div class="mt-6 flex items-center justify-between rounded-lg border border-blue-600 bg-blue-900/20 p-4">
		<span class="text-sm font-medium text-blue-300">
			{options.length} of 5 options (minimum 2 required)
		</span>
		<button type="button" class="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50" onclick={addOption} disabled={options.length >= 5}>
			<svg class="mr-2 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
			</svg>
			Add Answer Option
		</button>
	</div>
</div>
