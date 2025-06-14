<script lang="ts">
	import Sidebar from "$lib/components/Sidebar.svelte"
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { ReportHeader, ParticipantsTable, QuestionsList } from "./components"
	import { getAccuracyStrokeColor } from "$lib/report-utils"

	let { data } = $props()
	let activeTab = $state("participants")

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
</script>

<svelte:head>
	<title>Session Report - {data.quizSession.quiz.title || "Unknown Quiz"}</title>
</svelte:head>

<Sidebar />
<div class="ml-64 min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<AppHeader title="Session Report" />

	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<ReportHeader quizSession={data.quizSession} stats={data.stats} {formatDate} {getAccuracyColor} title={data.quizSession.quiz.title || "Unknown Quiz"} breadcrumbs={[{ label: "Report", href: "/reports" }, { label: data.quizSession.quiz.title || "Unknown Quiz" }]} />

		<!-- Tab Navigation -->
		<div class="rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
			<div class="border-b border-gray-700">
				<nav class="-mb-px flex">
					<button onclick={() => (activeTab = "participants")} class="w-1/2 border-b-2 px-6 py-4 text-center text-sm font-medium transition-colors {activeTab === 'participants' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-300'}">
						Participants ({data.participants.length})
					</button>
					<button onclick={() => (activeTab = "questions")} class="w-1/2 border-b-2 px-6 py-4 text-center text-sm font-medium transition-colors {activeTab === 'questions' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-300'}">
						Questions ({data.questions.length})
					</button>
				</nav>
			</div>

			<!-- Tab Content -->
			<div class="p-6">
				{#if activeTab === "participants"}
					{#if data.participants.length === 0}
						<div class="py-12 text-center">
							<svg class="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 715 0z"></path>
							</svg>
							<h3 class="mt-2 text-sm font-medium text-white">No participants</h3>
							<p class="mt-1 text-sm text-gray-400">No one has joined this session yet.</p>
						</div>
					{:else}
						<ParticipantsTable participants={data.participants} {getAccuracyStrokeColor} />
					{/if}
				{:else}
					<QuestionsList questions={data.questions} {formatQuestionType} />
				{/if}
			</div>
		</div>
	</main>
</div>
