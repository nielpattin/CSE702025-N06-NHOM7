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

<div class="bg-background min-h-screen">
	<AppHeader title="Browse" />

	<main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="mb-8 text-center">
			<h1 class="text-foreground mb-4 text-3xl font-bold">What would you like to browse?</h1>
			<p class="text-muted-foreground text-lg">Discover public quizzes or join active sessions</p>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			<Card class="border-border bg-card hover:bg-card-hover cursor-pointer transition-colors" onclick={navigateToQuizzes}>
				<CardHeader class="text-center">
					<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20">
						<BookOpen class="h-8 w-8 text-blue-400" />
					</div>
					<CardTitle class="text-foreground text-xl">Browse Quizzes</CardTitle>
					<CardDescription class="text-muted-foreground">Explore public quizzes created by the community</CardDescription>
				</CardHeader>
				<CardContent class="text-center">
					<Button onclick={navigateToQuizzes} class="w-full">
						<BookOpen class="mr-2 h-4 w-4" />
						View Quizzes
					</Button>
				</CardContent>
			</Card>

			<Card class="border-border bg-card hover:bg-card-hover cursor-pointer transition-colors" onclick={navigateToSessions}>
				<CardHeader class="text-center">
					<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600/20">
						<Users class="h-8 w-8 text-green-400" />
					</div>
					<CardTitle class="text-foreground text-xl">Browse Sessions</CardTitle>
					<CardDescription class="text-muted-foreground">Join active quiz sessions happening right now</CardDescription>
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
