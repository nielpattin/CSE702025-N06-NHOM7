<script lang="ts">
	import Sidebar from "$lib/components/Sidebar.svelte"
	import DashboardHeader from "$lib/components/DashboardHeader.svelte"
	import { ReportHeader, ParticipantsTab, QuestionsList } from "./components"

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

	function getAccuracyStrokeColor(accuracy: number): string {
		if (accuracy >= 80) return "#34d399" // green-400
		if (accuracy >= 60) return "#fbbf24" // yellow-400
		if (accuracy >= 40) return "#fb923c" // orange-400
		return "#f87171" // red-400
	}
</script>

<svelte:head>
	<title>Session Report - {data.quizSession.quiz.title}</title>
</svelte:head>

<Sidebar />
<div class="ml-64 min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<DashboardHeader title="Session Report - {data.quizSession.quiz.title}" />

	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<ReportHeader quizSession={data.quizSession} stats={data.stats} {formatDate} {getAccuracyColor} />

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
					<ParticipantsTab participants={data.participants} {getAccuracyStrokeColor} />
				{:else}
					<QuestionsList questions={data.questions} {formatQuestionType} />
				{/if}
			</div>
		</div>
	</main>
</div>
