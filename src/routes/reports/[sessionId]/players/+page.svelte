<script lang="ts">
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { ReportHeader, ParticipantsTable, QuestionsList } from "./components"
	import { getAccuracyStrokeColor } from "$lib/report-utils"
	import { Skeleton } from "$lib/components/ui/skeleton"
	import { navigationStore } from "$lib/stores/navigation"
	import { onMount } from "svelte"

	let { data } = $props()
	let activeTab = $state("participants")
	let isLoading = $state(true)
	let isPageVisible = $state(false)
	let visibleParticipants = $state<number[]>([])
	let visibleQuestions = $state<number[]>([])

	function formatDate(date: string | Date | null) {
		if (!date) return "Unknown"
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		})
	}

	function formatQuestionType(type: string | null) {
		if (!type) return "Unknown"
		return type === "multiple_choice" ? "Multiple Choice" : "True/False"
	}

	function getAccuracyColor(accuracy: number): string {
		if (accuracy >= 80) return "text-green-400"
		if (accuracy >= 60) return "text-yellow-400"
		if (accuracy >= 40) return "text-orange-400"
		return "text-red-400"
	}

	function handleTabChange(tabId: string) {
		activeTab = tabId
		if (tabId === "participants") {
			visibleParticipants = []
			setTimeout(() => {
				data.participants.forEach((_, index) => {
					setTimeout(() => {
						visibleParticipants = [...visibleParticipants, index]
					}, index * 100)
				})
			}, 100)
		} else {
			visibleQuestions = []
			setTimeout(() => {
				data.questions.forEach((_, index) => {
					setTimeout(() => {
						visibleQuestions = [...visibleQuestions, index]
					}, index * 100)
				})
			}, 100)
		}
	}

	onMount(() => {
		navigationStore.stopLoading()
		setTimeout(() => {
			isLoading = false
			setTimeout(() => {
				isPageVisible = true
				handleTabChange(activeTab)
			}, 100)
		}, 500)
	})
</script>

<svelte:head>
	<title>Session Report - {data.quizSession.quiz.title || "Unknown Quiz"}</title>
</svelte:head>

<div class=" bg-background min-h-screen">
	<AppHeader title="Session Report" />

	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		{#if isLoading}
			<!-- Skeleton Loading State -->
			<div class="mb-8">
				<!-- Header Skeleton -->
				<div class="mb-6">
					<Skeleton class="mb-4 h-8 w-64 rounded" />
					<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{#each Array(4) as _, i (i)}
							<div class="border-border bg-muted rounded-lg border p-4">
								<Skeleton class="mb-2 h-4 w-16 rounded" />
								<Skeleton class="h-6 w-12 rounded" />
							</div>
						{/each}
					</div>
				</div>

				<!-- Tab Navigation Skeleton -->
				<div class="border-border bg-muted rounded-lg border shadow-lg">
					<div class="border-border border-b">
						<div class="flex">
							<Skeleton class="h-12 flex-1 rounded-none" />
							<Skeleton class="h-12 flex-1 rounded-none" />
						</div>
					</div>

					<!-- Tab Content Skeleton -->
					<div class="p-6">
						<div class="space-y-4">
							{#each Array(5) as _, i (i)}
								<div class="border-border bg-muted/50 rounded-lg border p-4">
									<div class="flex items-center justify-between">
										<div class="flex items-center space-x-4">
											<Skeleton class="h-10 w-10 rounded-full" />
											<div>
												<Skeleton class="mb-1 h-4 w-24 rounded" />
												<Skeleton class="h-3 w-16 rounded" />
											</div>
										</div>
										<div class="flex items-center space-x-4">
											<Skeleton class="h-4 w-12 rounded" />
											<Skeleton class="h-4 w-16 rounded" />
											<Skeleton class="h-8 w-16 rounded-md" />
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{:else}
			<ReportHeader quizSession={data.quizSession} stats={data.stats} {formatDate} {getAccuracyColor} title={data.quizSession.quiz.title || "Unknown Quiz"} breadcrumbs={[{ label: "Report", href: "/reports" }, { label: data.quizSession.quiz.title || "Unknown Quiz" }]} />

			<!-- Tab Navigation -->
			<div class="border-border bg-card rounded-lg border shadow-lg">
				<div class="border-border border-b">
					<nav class="-mb-px flex">
						<button onclick={() => handleTabChange("participants")} class="w-1/2 border-b-2 px-6 py-4 text-center text-sm font-medium transition-colors {activeTab === 'participants' ? 'dark:border-primary dark:text-primary border-blue-700 text-blue-700' : 'dark:text-muted-foreground dark:hover:border-border dark:hover:text-foreground border-transparent text-gray-700 hover:border-gray-500 hover:text-gray-900 dark:border-transparent'}">
							Participants ({data.participants.length})
						</button>
						<button onclick={() => handleTabChange("questions")} class="w-1/2 border-b-2 px-6 py-4 text-center text-sm font-medium transition-colors {activeTab === 'questions' ? 'dark:border-primary dark:text-primary border-blue-700 text-blue-700' : 'dark:text-muted-foreground dark:hover:border-border dark:hover:text-foreground border-transparent text-gray-700 hover:border-gray-500 hover:text-gray-900 dark:border-transparent'}">
							Questions ({data.questions.length})
						</button>
					</nav>
				</div>

				<!-- Tab Content -->
				<div class="p-6">
					{#if activeTab === "participants"}
						{#if data.participants.length === 0}
							<div class="py-12 text-center">
								<svg class="text-muted-foreground mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 715 0z"></path>
								</svg>
								<h3 class="dark:text-foreground mt-2 text-sm font-medium text-gray-900">No participants</h3>
								<p class="text-muted-foreground mt-1 text-sm">No one has joined this session yet.</p>
							</div>
						{:else}
							<ParticipantsTable participants={data.participants} {getAccuracyStrokeColor} {visibleParticipants} />
						{/if}
					{:else}
						<QuestionsList questions={data.questions} {formatQuestionType} {visibleQuestions} />
					{/if}
				</div>
			</div>
		{/if}
	</main>
</div>
