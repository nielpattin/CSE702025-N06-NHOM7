<script lang="ts">
	import type { PageData, ActionData } from "./$types"
	import { Toast, Button } from "flowbite-svelte"
	import { slide } from "svelte/transition"
	import { ArrowLeftOutline } from "flowbite-svelte-icons"
	import { AddQuestionButton, QuizDetailsForm, QuestionsList } from "./components"

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
	let toastStatus = $state(false)
	let toastMessage = $state("")

	$effect(() => {
		if (form && "success" in form && form.success) {
			toastMessage = "Quiz title updated successfully!"
			toastStatus = true
			setTimeout(() => {
				toastStatus = false
			}, 3000)
		} else if (form && "error" in form && form.error) {
			toastMessage = form.error
			toastStatus = true
			setTimeout(() => {
				toastStatus = false
			}, 3000)
		}
	})

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

<Toast color={form && "success" in form && form.success ? "green" : "red"} class={form && "success" in form && form.success ? "!border !border-emerald-500 !bg-emerald-600 !text-emerald-50 !shadow-lg !shadow-emerald-500/20" : "!border !border-red-500 !bg-red-600 !text-red-50 !shadow-lg !shadow-red-500/20"} transition={slide} position="bottom-right" bind:toastStatus>
	{toastMessage}
</Toast>

<div class="mb-6">
	<Button href="/quiz/{data.quiz.id}" class="!border-0 !bg-gradient-to-r !from-gray-600 !to-gray-700 !text-white !shadow-md hover:!from-gray-700 hover:!to-gray-800 focus:!ring-0 focus:!outline-none">
		<ArrowLeftOutline class="me-2 h-4 w-4" />
		Back to Quiz
	</Button>
</div>

<QuizDetailsForm quizTitle={data.quiz.title} />

<AddQuestionButton quizId={data.quiz.id} />

<QuestionsList {questions} quizId={data.quiz.id} {timeOptions} {pointOptions} onTimeChange={handleTimeChange} onPointsChange={handlePointsChange} />
