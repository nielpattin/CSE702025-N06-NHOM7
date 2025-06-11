<script lang="ts">
	import { SessionHeader, SessionInfoCard } from "./components"
	import type { ActionData, PageData } from "./$types"

	let { data, form: actionData }: { data: PageData; form: ActionData | undefined } = $props()
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<SessionHeader title={data.session.quiz.title ?? ""} />

	<!-- Main Content -->
	<main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Single column layout -->
		<div class="space-y-8">
			<SessionInfoCard session={data.session} {actionData} />
		</div>
	</main>
</div>
