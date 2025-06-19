<script lang="ts">
	import { Card, CardContent } from "$lib/components/ui/card"
	import { Badge } from "$lib/components/ui/badge"
	import { Check, X, Info } from "@lucide/svelte"

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

	const trueOption = $derived(options.find((o: QuestionOption) => o.content === "True"))
	const falseOption = $derived(options.find((o: QuestionOption) => o.content === "False"))

	function setTrueCorrect() {
		const newOptions = options.map((option: QuestionOption) => ({
			...option,
			correct: option.content === "True"
		}))
		onOptionsChange(newOptions)
	}

	function setFalseCorrect() {
		const newOptions = options.map((option: QuestionOption) => ({
			...option,
			correct: option.content === "False"
		}))
		onOptionsChange(newOptions)
	}
</script>

<div class="{className} grid grid-cols-1 gap-4 md:grid-cols-2">
	<!-- True Option -->
	<Card class="relative w-full cursor-pointer border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20" onclick={setTrueCorrect}>
		<CardContent class="p-4">
			<div class="flex items-center gap-4">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
					<Check class="h-5 w-5" />
				</div>
				<div>
					<h3 class="text-lg font-semibold">True</h3>
					<p class="text-muted-foreground text-sm">Select if this is the correct answer</p>
				</div>
			</div>
			{#if trueOption?.correct}
				<div class="absolute -top-1 -right-1">
					<Badge variant="default" class="bg-green-600 text-white">
						<Check class="h-3 w-3" />
					</Badge>
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- False Option -->
	<Card class="relative w-full cursor-pointer border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20" onclick={setFalseCorrect}>
		<CardContent class="p-4">
			<div class="flex items-center gap-4">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white">
					<X class="h-5 w-5" />
				</div>
				<div>
					<h3 class="text-lg font-semibold">False</h3>
					<p class="text-muted-foreground text-sm">Select if this is the correct answer</p>
				</div>
			</div>
			{#if falseOption?.correct}
				<div class="absolute -top-1 -right-1">
					<Badge variant="default" class="bg-red-600 text-white">
						<Check class="h-3 w-3" />
					</Badge>
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Info Note -->
	<div class="col-span-2">
		<Card class="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
			<CardContent class="p-4">
				<div class="flex items-start gap-3">
					<Info class="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
					<div>
						<p class="text-sm font-medium text-blue-900 dark:text-blue-100">Note: Only one answer can be correct for True/False questions.</p>
						<p class="mt-1 text-xs text-blue-700 dark:text-blue-300">Select either True or False as the correct answer for this question.</p>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
