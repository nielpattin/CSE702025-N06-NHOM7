<script lang="ts">
	import QuestionCard from "./QuestionCard.svelte"

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

	let { questions, quizId, timeOptions, pointOptions, onTimeChange, onPointsChange, onDeleteQuestion } = $props<{
		questions: Question[]
		quizId: number
		timeOptions: Array<{ value: number; label: string }>
		pointOptions: number[]
		onTimeChange: (questionId: number, timeValue: number) => void
		onPointsChange: (questionId: number, pointsValue: number) => void
		onDeleteQuestion?: (questionId: number) => void
	}>()
</script>

<div class="space-y-4">
	{#each questions as question, index (question.id)}
		<div class="relative">
			<QuestionCard {question} {quizId} {timeOptions} {pointOptions} {onTimeChange} {onPointsChange} {onDeleteQuestion} />
		</div>
	{/each}
</div>
