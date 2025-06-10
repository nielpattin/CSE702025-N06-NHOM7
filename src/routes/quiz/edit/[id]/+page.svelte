<script lang="ts">
	import type { PageData, ActionData } from "./$types"
	import QuizEditHeader from "$lib/components/quiz/QuizEditHeader.svelte"
	import AlertMessage from "$lib/components/quiz/AlertMessage.svelte"
	import QuizDetailsForm from "$lib/components/quiz/QuizDetailsForm.svelte"
	import AddQuestionButton from "$lib/components/quiz/AddQuestionButton.svelte"
	import QuestionsList from "$lib/components/quiz/QuestionsList.svelte"

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

	let { data, form } = $props<{
		data: PageData
		form: ActionData
	}>()

	let questions: Question[] = $state(data.questions)

	// Time limit options in seconds with labels
	const timeOptions = [
		{ value: 5, label: "5 seconds" },
		{ value: 10, label: "10 seconds" },
		{ value: 20, label: "20 seconds" },
		{ value: 30, label: "30 seconds" },
		{ value: 45, label: "45 seconds" },
		{ value: 60, label: "1 minute" },
		{ value: 120, label: "2 minutes" },
		{ value: 180, label: "3 minutes" },
		{ value: 300, label: "5 minutes" },
		{ value: 600, label: "10 minutes" },
		{ value: 900, label: "15 minutes" },
		{ value: 1200, label: "20 minutes" },
		{ value: 1800, label: "30 minutes" }
	]

	// Points options
	const pointOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 50, 100, 200, 500, 1000]

	// Function to handle time limit changes
	function handleTimeChange(questionId: number, timeValue: number) {
		const questionIndex = questions.findIndex((q: Question) => q.id === questionId)
		if (questionIndex !== -1) {
			questions[questionIndex].timeLimit = timeValue
		}
	}

	// Function to handle points changes
	function handlePointsChange(questionId: number, pointsValue: number) {
		const questionIndex = questions.findIndex((q: Question) => q.id === questionId)
		if (questionIndex !== -1) {
			questions[questionIndex].points = pointsValue
		}
	}
</script>

<svelte:head>
	<title>Edit Quiz - Quiz Learn</title>
	<meta name="description" content="Edit quiz details and manage questions" />
</svelte:head>

<QuizEditHeader quizId={data.quiz.id} />

{#if form && "success" in form && form.success}
	<AlertMessage type="success" message="Quiz title updated successfully!" />
{/if}

{#if form && "error" in form && form.error}
	<AlertMessage type="error" message={form.error} />
{/if}

<QuizDetailsForm quizTitle={data.quiz.title} />

<AddQuestionButton quizId={data.quiz.id} />

<QuestionsList {questions} quizId={data.quiz.id} {timeOptions} {pointOptions} onTimeChange={handleTimeChange} onPointsChange={handlePointsChange} />
