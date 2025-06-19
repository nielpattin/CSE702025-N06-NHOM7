<script lang="ts">
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { SessionInfoCard } from "./components"
	import type { ActionData, PageData } from "./$types"

	let { data, form: actionData }: { data: PageData; form: ActionData | undefined } = $props()
</script>

<div class="bg-background min-h-screen">
	<AppHeader title={data.quizSession.quiz.title ?? ""} />

	<!-- Main Content -->
	<main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Single column layout -->
		<div class="space-y-8">
			<SessionInfoCard session={data.quizSession} {actionData} />
		</div>
	</main>
</div>
