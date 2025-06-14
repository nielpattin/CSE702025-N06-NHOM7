<script lang="ts">
	import type { PageData, ActionData } from "./$types"
	import { enhance } from "$app/forms"
	import { AlertMessage } from "../../../../components"
	import { QuestionEditHeader, AnswerOptionsContainer, QuestionContentForm } from "./components"

	type QuestionOption = {
		id?: number
		content: string
		correct: boolean
	}

	type Question = {
		id: string | number
		type: "multiple_choice" | "true_false"
		content: string
		points: number
		timeLimit: number
		options: QuestionOption[]
	}

	let { data, form } = $props<{ data: PageData; form?: ActionData }>()

	let { quiz } = data
	let question = $state<Question>(data.question as Question)
	let isSubmitting = $state(false)
	let showSuccess = $state(false)

	// Handle question type changes and ensure correct options structure
	$effect(() => {
		if (question.type === "true_false") {
			if (question.options.length !== 2 || !question.options.find((o) => o.content === "True") || !question.options.find((o) => o.content === "False")) {
				const isTrueCorrect = question.options.find((o) => o.correct)?.content === "True"
				question.options = [
					{ content: "True", correct: !!isTrueCorrect },
					{ content: "False", correct: !isTrueCorrect }
				]
			}
		} else if (question.type === "multiple_choice") {
			if (question.options.length === 2 && question.options.find((o) => o.content === "True") && question.options.find((o) => o.content === "False")) {
				question.options = []
			}
		}
	})

	// Handle form submission
	function handleEnhance() {
		isSubmitting = true
		showSuccess = false
		return async ({ result, update }: { result: { type: string; [key: string]: unknown }; update: () => Promise<void> }) => {
			isSubmitting = false
			if (result.type === "success") {
				showSuccess = true
				setTimeout(() => {
					showSuccess = false
				}, 3000)
			}
			await update()
		}
	}

	// Handler functions for component props
	function handleTypeChange(type: "multiple_choice" | "true_false") {
		question.type = type
	}

	function handlePointsChange(points: number) {
		question.points = points
	}

	function handleTimeLimitChange(timeLimit: number) {
		question.timeLimit = timeLimit
	}

	function handleContentChange(content: string) {
		question.content = content
	}

	function handleOptionsChange(options: QuestionOption[]) {
		question.options = options
	}
</script>

<svelte:head>
	<title>Edit Question - Quiz Learn</title>
	<meta name="description" content="Edit quiz question and answer options" />
</svelte:head>

<form method="POST" class="space-y-8" use:enhance={handleEnhance}>
	<!-- Hidden inputs for form data -->
	<input type="hidden" name="content" bind:value={question.content} />
	<input type="hidden" name="type" bind:value={question.type} />
	<input type="hidden" name="points" bind:value={question.points} />
	<input type="hidden" name="time_limit" bind:value={question.timeLimit} />

	<!-- Hidden inputs for options -->
	{#each question.options as option, index (index)}
		<input type="hidden" name="option-content-{index}" bind:value={option.content} />
		<input type="hidden" name="option-correct-{index}" value={option.correct ? "on" : ""} />
	{/each}

	<!-- Success Message -->
	{#if showSuccess}
		<AlertMessage type="success" message="Question saved successfully!" />
	{/if}

	<!-- Error Message -->
	{#if form?.error}
		<AlertMessage type="error" message={form.error} />
	{/if}

	<!-- Question Edit Header -->
	<QuestionEditHeader quizId={quiz.id} questionType={question.type} points={question.points} timeLimit={question.timeLimit} {isSubmitting} onTypeChange={handleTypeChange} onPointsChange={handlePointsChange} onTimeLimitChange={handleTimeLimitChange} />

	<!-- Question Content Form -->
	<QuestionContentForm content={question.content} onContentChange={handleContentChange} />

	<!-- Answer Options -->
	<AnswerOptionsContainer questionType={question.type} options={question.options} onOptionsChange={handleOptionsChange} />
</form>
