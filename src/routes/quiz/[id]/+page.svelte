<script lang="ts">
	import QuizDetailsCard from "./components/QuizDetailsCard.svelte"
	import QuestionsList from "./components/QuestionsList.svelte"
	import type { PageData } from "./$types"

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>{data.quiz.title || "Quiz Details"} - Quiz Learn</title>
	<meta name="description" content="View quiz details, questions, and manage your quiz settings" />
</svelte:head>

<main class="mx-auto max-w-6xl px-4 py-8 select-none sm:px-6 lg:px-8">
	<div class="space-y-6">
		<QuizDetailsCard {data} />
		<QuestionsList quiz={data.quiz} isOwner={data.isOwner} />
	</div>
</main>
