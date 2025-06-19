<script lang="ts">
	import AppHeader from "$lib/components/AppHeader.svelte"
	import CircularProgress from "../../components/CircularProgress.svelte"
	import LinearProgressBar from "../../components/LinearProgressBar.svelte"
	import { getAccuracyStrokeColor } from "$lib/report-utils"

	let { data } = $props()

	const breadcrumbs = [{ label: "Report", href: "/reports" }, { label: data.quiz.title, href: `/reports/${data.participant.quizSessionId}/players` }, { label: data.participant.user?.name || data.participant.name }]
</script>

<div class=" bg-background min-h-screen">
	<AppHeader title="Participant Attempts" />

	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="mb-8">
			<nav class="mb-4 flex" aria-label="Breadcrumb">
				<ol class="flex items-center space-x-4">
					{#each breadcrumbs as breadcrumb, index (breadcrumb.label)}
						<li>
							{#if breadcrumb.href && index < breadcrumbs.length - 1}
								<a href={breadcrumb.href} class="hover:text-foreground text-muted-foreground transition-colors">
									{breadcrumb.label}
								</a>
							{:else}
								<span class="text-foreground font-medium">{breadcrumb.label}</span>
							{/if}
						</li>
						{#if index < breadcrumbs.length - 1}
							<li>
								<span class="text-muted-foreground">/</span>
							</li>
						{/if}
					{/each}
				</ol>
			</nav>
			<h1 class="text-foreground mb-2 text-3xl font-bold">Participant Attempts</h1>
			<div class="flex items-center space-x-4">
				{#if data.participant.user?.image}
					<img src={data.participant.user.image} alt={data.participant.name} class="border-border h-12 w-12 rounded-full border-2" />
				{:else}
					<div class="border-border bg-muted text-foreground flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl font-semibold">
						{data.participant.name?.charAt(0).toUpperCase()}
					</div>
				{/if}
				<div>
					<div class="text-foreground text-xl font-semibold">{data.participant.name}</div>
					{#if data.participant.user?.name}
						<div class="text-muted-foreground text-sm">{data.participant.user.name}</div>
					{/if}
				</div>
			</div>
		</div>

		<div class="space-y-4">
			{#if data.attempts.length === 0}
				<div class="border-border bg-card text-muted-foreground rounded-lg border py-12 text-center">No attempts found for this participant.</div>
			{:else}
				<div class="text-muted-foreground grid grid-cols-5 items-center gap-4 px-6 pb-4 text-sm font-semibold uppercase">
					<span class="text-left">Attempt #</span>
					<span class="text-center"></span>
					<span class="text-center">Answer Accuracy</span>
					<span class="text-center">Correct Answers</span>
					<span class="text-center">Score</span>
				</div>
				{#each data.attempts as attempt, i (attempt.id)}
					{@const correctAnswers = attempt.correctAnswers}
					{@const incorrectAnswers = attempt.totalQuestions - correctAnswers}
					<a href="/reports/{data.participant.quizSessionId}/players/{data.participant.id}/attempts/{attempt.id}" class="border-border bg-card hover:bg-muted grid cursor-pointer grid-cols-5 items-center gap-4 rounded-lg border px-4 py-2 transition-colors">
						<div class="flex items-center">
							<span class="text-foreground text-base font-semibold">
								Attempt {data.attempts.length - i}
							</span>
						</div>

						<div class="flex items-center justify-center">
							<LinearProgressBar correct={correctAnswers} incorrect={incorrectAnswers} />
						</div>

						<div class="flex items-center justify-center">
							<CircularProgress percentage={attempt.accuracy} size={50} strokeWidth={6} color={getAccuracyStrokeColor(attempt.accuracy)} />
						</div>

						<div class="flex items-center justify-center">
							<span class="text-foreground text-lg font-bold">
								{attempt.correctAnswers ?? 0} / {attempt.totalQuestions ?? 0}
							</span>
						</div>

						<div class="flex items-center justify-center">
							<span class="text-foreground text-lg font-bold">
								{attempt.score ?? 0} / {attempt.totalPoints ?? 0}
							</span>
						</div>
					</a>
				{/each}
			{/if}
		</div>
	</main>
</div>
