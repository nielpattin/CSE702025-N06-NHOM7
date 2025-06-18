<script lang="ts">
	import { goto } from "$app/navigation"
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card"
	import { Button } from "$lib/components/ui/button"
	import { BookOpen, Users } from "@lucide/svelte"

	function navigateToQuizzes() {
		goto("/browse/quizzes")
	}

	function navigateToSessions() {
		goto("/browse/sessions")
	}
</script>

<svelte:head>
	<title>Browse - Quiz Learn</title>
	<meta name="description" content="Browse public quizzes and active sessions" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<AppHeader title="Browse" />

	<main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="mb-8 text-center">
			<h1 class="mb-4 text-3xl font-bold text-white">What would you like to browse?</h1>
			<p class="text-lg text-gray-300">Discover public quizzes or join active sessions</p>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			<Card class="cursor-pointer border-gray-700 bg-gray-800/50 transition-colors hover:bg-gray-800/70" onclick={navigateToQuizzes}>
				<CardHeader class="text-center">
					<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20">
						<BookOpen class="h-8 w-8 text-blue-400" />
					</div>
					<CardTitle class="text-xl text-white">Browse Quizzes</CardTitle>
					<CardDescription class="text-gray-300">Explore public quizzes created by the community</CardDescription>
				</CardHeader>
				<CardContent class="text-center">
					<Button onclick={navigateToQuizzes} class="w-full">
						<BookOpen class="mr-2 h-4 w-4" />
						View Quizzes
					</Button>
				</CardContent>
			</Card>

			<Card class="cursor-pointer border-gray-700 bg-gray-800/50 transition-colors hover:bg-gray-800/70" onclick={navigateToSessions}>
				<CardHeader class="text-center">
					<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600/20">
						<Users class="h-8 w-8 text-green-400" />
					</div>
					<CardTitle class="text-xl text-white">Browse Sessions</CardTitle>
					<CardDescription class="text-gray-300">Join active quiz sessions happening right now</CardDescription>
				</CardHeader>
				<CardContent class="text-center">
					<Button onclick={navigateToSessions} variant="secondary" class="w-full">
						<Users class="mr-2 h-4 w-4" />
						View Sessions
					</Button>
				</CardContent>
			</Card>
		</div>
	</main>
</div>
