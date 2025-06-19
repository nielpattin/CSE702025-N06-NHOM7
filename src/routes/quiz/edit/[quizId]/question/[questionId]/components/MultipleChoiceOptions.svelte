<script lang="ts">
	import { Button } from "$lib/components/ui/button"
	import { Card, CardContent } from "$lib/components/ui/card"
	import { Badge } from "$lib/components/ui/badge"
	import { Plus } from "@lucide/svelte"
	import AnswerOption from "./AnswerOption.svelte"

	type QuestionOption = {
		id?: number
		content: string
		correct: boolean
	}

	let {
		options,
		onOptionsChange,
		class: className
	} = $props<{
		options: QuestionOption[]
		onOptionsChange: (options: QuestionOption[]) => void
		class?: string
	}>()

	const colors = ["bg-[#2a62a6]", "bg-[#2a9696]", "bg-[#e69a2a]", "bg-[#d5546d]", "bg-[#8a2a8a]"]

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

<div class="flex h-full gap-4 {className}">
	{#each options as option, index (index)}
		<div class="h-full w-full min-w-0 flex-1">
			<AnswerOption {option} {index} canRemove={options.length > 1} onContentChange={(content) => updateOption(index, { content })} onCorrectChange={(correct) => updateOption(index, { correct })} onRemove={() => removeOption(index)} cardClass="h-72" colorClass={colors[index % colors.length]} />
		</div>
	{/each}

	{#if options.length < 5}
		<div class="h-full flex-1">
			<Card class="bg-muted/20 hover:bg-muted/30 relative flex h-full min-h-64 cursor-pointer items-center justify-center border-dashed transition-colors" onclick={addOption}>
				<CardContent class="flex h-full w-full flex-col items-center justify-center p-4">
					<Plus class="text-muted-foreground h-12 w-12" />
					<span class="text-muted-foreground mt-2 text-lg font-semibold">Add Option</span>
				</CardContent>
			</Card>
		</div>
	{/if}
</div>
