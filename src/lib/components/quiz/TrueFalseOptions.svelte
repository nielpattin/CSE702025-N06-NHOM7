<script lang="ts">
	type QuestionOption = {
		id?: number
		content: string
		correct: boolean
	}

	let { options, onOptionsChange } = $props<{
		options: QuestionOption[]
		onOptionsChange: (options: QuestionOption[]) => void
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

<div class="space-y-4">
	<div class="rounded-lg border border-green-600 bg-green-900/20 p-4 shadow-md">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
					<span class="text-xl font-bold text-white">T</span>
				</div>
				<span class="text-xl font-semibold text-white">True</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<span class="text-sm font-medium text-gray-300">Correct Answer</span>
				<input type="checkbox" checked={trueOption?.correct} onchange={setTrueCorrect} class="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800" />
			</div>
		</div>
	</div>

	<div class="rounded-lg border border-red-600 bg-red-900/20 p-4 shadow-md">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-600">
					<span class="text-xl font-bold text-white">F</span>
				</div>
				<span class="text-xl font-semibold text-white">False</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<span class="text-sm font-medium text-gray-300">Correct Answer</span>
				<input type="checkbox" checked={falseOption?.correct} onchange={setFalseCorrect} class="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800" />
			</div>
		</div>
	</div>

	<div class="mt-4 rounded-lg border border-blue-600 bg-blue-900/20 p-4">
		<p class="text-sm font-medium text-blue-300">
			<svg class="mr-2 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span class="font-bold">Note:</span> Only one answer can be correct for True/False questions.
		</p>
	</div>
</div>
