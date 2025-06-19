<script lang="ts">
	import type { PageData, ActionData } from "./$types"
	import { Button } from "$lib/components/ui/button"
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card"
	import { ArrowLeft, Plus } from "@lucide/svelte"
	import { QuizDetailsForm, QuestionsList, EmptyQuestionsState } from "./components"
	import { toast } from "svelte-sonner"
	import { Toaster } from "$lib/components/ui/sonner"

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

	$effect(() => {
		if (form && "success" in form && form.success) {
			toast.success("Quiz title updated successfully!")
		} else if (form && "error" in form && form.error) {
			toast.error(form.error)
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
	async function handleTimeChange(questionId: number, timeValue: number) {
		const questionIndex = questions.findIndex((q: Question) => q.id === questionId)
		if (questionIndex === -1) return

		try {
			const response = await fetch(`/quiz/edit/${data.quiz.id}/question/${questionId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					timeLimit: timeValue
				})
			})

			if (response.ok) {
				// Update local state
				questions[questionIndex].timeLimit = timeValue
				const timeLabel = timeOptions.find((opt) => opt.value === timeValue)?.label || `${timeValue}s`
				toast.success(`Time limit updated to ${timeLabel}`)
			} else {
				const errorData = await response.json()
				toast.error(errorData.error || "Failed to update time limit")
			}
		} catch (error) {
			console.error("Error updating time limit:", error)
			toast.error("Failed to update time limit")
		}
	}

	// Function to handle points changes
	async function handlePointsChange(questionId: number, pointsValue: number) {
		const questionIndex = questions.findIndex((q: Question) => q.id === questionId)
		if (questionIndex === -1) return

		try {
			const response = await fetch(`/quiz/edit/${data.quiz.id}/question/${questionId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					points: pointsValue
				})
			})

			if (response.ok) {
				// Update local state
				questions[questionIndex].points = pointsValue
				toast.success(`Points updated to ${pointsValue}`)
			} else {
				const errorData = await response.json()
				toast.error(errorData.error || "Failed to update points")
			}
		} catch (error) {
			console.error("Error updating points:", error)
			toast.error("Failed to update points")
		}
	}

	// Function to handle question deletion
	async function handleDeleteQuestion(questionId: number) {
		try {
			const response = await fetch(`/quiz/edit/${data.quiz.id}/question/${questionId}`, {
				method: "DELETE"
			})

			if (response.ok) {
				// Remove question from local state
				questions = questions.filter((q: Question) => q.id !== questionId)
				toast.success("Question deleted successfully!")
			} else {
				const errorData = await response.json()
				toast.error(errorData.error || "Failed to delete question")
			}
		} catch (error) {
			console.error("Error deleting question:", error)
			toast.error("Failed to delete question")
		}
	}
</script>

<svelte:head>
	<title>Edit Quiz - Quiz Learn</title>
	<meta name="description" content="Edit quiz details and manage questions" />
</svelte:head>

<div class="space-y-6">
	<!-- Header with back button -->
	<div class="sticky top-0 z-[51] -mx-4 -mt-4 px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" style="background-color: var(--background) !important;">
		<div class="flex items-center justify-between">
			<Button href="/quiz/{data.quiz.id}" variant="outline" class="gap-2">
				<ArrowLeft class="h-4 w-4" />
				Back to Quiz
			</Button>
		</div>
	</div>

	<!-- Quiz Details Form -->
	<Card>
		<CardHeader>
			<CardTitle>Quiz Details</CardTitle>
			<CardDescription>Update your quiz title and settings</CardDescription>
		</CardHeader>
		<CardContent>
			<QuizDetailsForm quizTitle={data.quiz.title} quizDescription={data.quiz.description || ""} availableTags={data.availableTags} selectedTagIds={data.selectedTagIds} />
		</CardContent>
	</Card>

	<!-- Questions Section -->
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center justify-between">
				<span>Questions ({questions.length})</span>
				{#if questions.length > 0}
					<Button href="/quiz/edit/{data.quiz.id}/question/new" variant="outline" size="sm" class="gap-2">
						<Plus class="h-4 w-4" />
						Add Question
					</Button>
				{/if}
			</CardTitle>
			<CardDescription>Manage the questions for your quiz</CardDescription>
		</CardHeader>
		<CardContent>
			{#if questions.length > 0}
				<QuestionsList {questions} quizId={data.quiz.id} {timeOptions} {pointOptions} onTimeChange={handleTimeChange} onPointsChange={handlePointsChange} onDeleteQuestion={handleDeleteQuestion} />
			{:else}
				<EmptyQuestionsState quizId={data.quiz.id} />
			{/if}
		</CardContent>
	</Card>
</div>

<Toaster richColors />
