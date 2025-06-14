<script lang="ts">
	import QuestionCard from "./QuestionCard.svelte"
	import EmptyQuestionsState from "./EmptyQuestionsState.svelte"

	interface Question {
		id: number
		content: string
		type: string | null
		timeLimit: number | null
		points: number | null
		options: Array<{
			id: number
			content: string
			correct: boolean
		}> | null
	}

	let { questions, quizId, timeOptions, pointOptions, onTimeChange, onPointsChange } = $props<{
		questions: Question[]
		quizId: number
		timeOptions: Array<{ value: number; label: string }>
		pointOptions: number[]
		onTimeChange: (questionId: number, timeValue: number) => void
		onPointsChange: (questionId: number, pointsValue: number) => void
	}>()
</script>

<div>
	<h2 class="mb-6 text-2xl font-bold text-white">Questions</h2>
	{#if questions.length > 0}
		<div class="space-y-6">
			{#each questions as question, index (question.id)}
				<QuestionCard {question} {quizId} {timeOptions} {pointOptions} {onTimeChange} {onPointsChange} />
			{/each}
		</div>
	{:else}
		<EmptyQuestionsState {quizId} />
	{/if}
</div>
