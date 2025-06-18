<script lang="ts">
	import { page } from "$app/state"
	import { goto } from "$app/navigation"
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card"
	import { Button } from "$lib/components/ui/button"
	import { Badge } from "$lib/components/ui/badge"
	import { BookOpen, Users, Target, TrendingUp, Plus, Search, Play, FileText, Clock, Star } from "@lucide/svelte"

	let data = $derived(page.data)
	let session = $derived(data.session)
	let { userStats, recentQuizzes, recentSessions, globalStats } = $derived(data)

	function getStatusColor(status: string) {
		switch (status) {
			case "published":
				return "bg-green-500"
			case "draft":
				return "bg-yellow-500"
			case "archived":
				return "bg-gray-500"
			case "active":
				return "bg-green-500"
			case "inactive":
				return "bg-gray-500"
			case "expired":
				return "bg-red-500"
			default:
				return "bg-gray-500"
		}
	}

	function getStatusText(status: string) {
		return status.charAt(0).toUpperCase() + status.slice(1)
	}

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric"
		})
	}
</script>

<svelte:head>
	<title>Dashboard - Quiz Learn</title>
	<meta name="description" content="Your Quiz Learn dashboard overview" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<AppHeader title="Dashboard" />

	<main class="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
		<!-- Welcome Section -->
		<div class="mb-8">
			<h1 class="mb-2 text-2xl font-bold text-white">
				Welcome back, {session?.user?.name || "User"}!
			</h1>
			<p class="text-gray-300">Here's an overview of your quiz activities and what's happening.</p>
		</div>

		<!-- Stats Cards -->
		<div class="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
			<Card class="border-gray-700 bg-gray-800/50">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-gray-300">Your Quizzes</CardTitle>
					<BookOpen class="h-4 w-4 text-blue-400" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-white">{userStats.totalQuizzes}</div>
					<p class="text-xs text-gray-400">Total created</p>
				</CardContent>
			</Card>

			<Card class="border-gray-700 bg-gray-800/50">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-gray-300">Your Sessions</CardTitle>
					<Target class="h-4 w-4 text-green-400" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-white">{userStats.totalSessions}</div>
					<p class="text-xs text-gray-400">Total hosted</p>
				</CardContent>
			</Card>

			<Card class="border-gray-700 bg-gray-800/50">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-gray-300">Participants</CardTitle>
					<Users class="h-4 w-4 text-purple-400" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-white">{userStats.totalParticipants}</div>
					<p class="text-xs text-gray-400">Across all sessions</p>
				</CardContent>
			</Card>

			<Card class="border-gray-700 bg-gray-800/50">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-gray-300">Community</CardTitle>
					<TrendingUp class="h-4 w-4 text-orange-400" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-white">{globalStats.publicQuizzes}</div>
					<p class="text-xs text-gray-400">Public quizzes available</p>
				</CardContent>
			</Card>
		</div>

		<!-- Quick Actions -->
		<div class="mb-8">
			<h2 class="mb-4 text-xl font-semibold text-white">Quick Actions</h2>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Button onclick={() => goto("/quiz/create")} class="h-auto cursor-pointer flex-col space-y-2 p-4">
					<Plus class="h-6 w-6" />
					<span>Create Quiz</span>
				</Button>
				<Button onclick={() => goto("/browse")} variant="secondary" class="h-auto cursor-pointer flex-col space-y-2 p-4">
					<Search class="h-6 w-6" />
					<span>Browse</span>
				</Button>
				<Button onclick={() => goto("/library")} variant="outline" class="h-auto cursor-pointer flex-col space-y-2 p-4">
					<BookOpen class="h-6 w-6" />
					<span>My Library</span>
				</Button>
				<Button onclick={() => goto("/sessions")} variant="outline" class="h-auto cursor-pointer flex-col space-y-2 p-4">
					<Target class="h-6 w-6" />
					<span>My Sessions</span>
				</Button>
			</div>
		</div>

		<!-- Recent Activity -->
		<div class="grid gap-8 lg:grid-cols-2">
			<!-- Recent Quizzes -->
			<div>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-xl font-semibold text-white">Recent Quizzes</h2>
					<Button onclick={() => goto("/library")} variant="ghost" size="sm">View All</Button>
				</div>
				<Card class="border-gray-700 bg-gray-800/50">
					<CardContent class="p-0">
						{#if recentQuizzes.length > 0}
							<div class="space-y-0">
								{#each recentQuizzes as quiz, index (quiz.id)}
									<div class="p-4 {index !== recentQuizzes.length - 1 ? 'border-b border-gray-700' : ''}">
										<div class="flex items-center justify-between">
											<div class="min-w-0 flex-1">
												<h3 class="truncate text-sm font-medium text-white">
													{quiz.title || "Untitled Quiz"}
												</h3>
												<div class="mt-1 flex items-center space-x-2 text-xs text-gray-400">
													<span>{quiz.questionCount} question{quiz.questionCount !== 1 ? "s" : ""}</span>
													<span>•</span>
													<span>{formatDate(quiz.createdAt)}</span>
												</div>
											</div>
											<Badge class="{getStatusColor(quiz.status)} text-xs text-white">
												{getStatusText(quiz.status)}
											</Badge>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="p-8 text-center">
								<FileText class="mx-auto mb-4 h-12 w-12 text-gray-400" />
								<p class="text-gray-400">No quizzes created yet</p>
								<Button onclick={() => goto("/quiz/create")} size="sm" class="mt-3">Create Your First Quiz</Button>
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>

			<!-- Recent Sessions -->
			<div>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-xl font-semibold text-white">Recent Sessions</h2>
					<Button onclick={() => goto("/sessions")} variant="ghost" size="sm">View All</Button>
				</div>
				<Card class="border-gray-700 bg-gray-800/50">
					<CardContent class="p-0">
						{#if recentSessions.length > 0}
							<div class="space-y-0">
								{#each recentSessions as session, index (session.id)}
									<div class="p-4 {index !== recentSessions.length - 1 ? 'border-b border-gray-700' : ''}">
										<div class="flex items-center justify-between">
											<div class="min-w-0 flex-1">
												<h3 class="truncate text-sm font-medium text-white">
													{session.quizTitle || "Unknown Quiz"}
												</h3>
												<div class="mt-1 flex items-center space-x-2 text-xs text-gray-400">
													<span>Code: {session.code}</span>
													<span>•</span>
													<span>{session.participantCount} participant{session.participantCount !== 1 ? "s" : ""}</span>
													<span>•</span>
													<span>{formatDate(session.createdAt)}</span>
												</div>
											</div>
											<Badge class="{getStatusColor(session.status)} text-xs text-white">
												{getStatusText(session.status)}
											</Badge>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="p-8 text-center">
								<Target class="mx-auto mb-4 h-12 w-12 text-gray-400" />
								<p class="text-gray-400">No sessions hosted yet</p>
								<Button onclick={() => goto("/library")} size="sm" class="mt-3">Start a Session</Button>
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>
		</div>

		<!-- Community Activity -->
		<div class="mt-8">
			<h2 class="mb-4 text-xl font-semibold text-white">Community Activity</h2>
			<div class="grid gap-4 md:grid-cols-2">
				<Card class="border-gray-700 bg-gray-800/50">
					<CardHeader>
						<CardTitle class="flex items-center text-white">
							<BookOpen class="mr-2 h-5 w-5 text-blue-400" />
							Public Quizzes
						</CardTitle>
						<CardDescription class="text-gray-300">Discover quizzes from the community</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="flex items-center justify-between">
							<div>
								<div class="text-2xl font-bold text-white">{globalStats.publicQuizzes}</div>
								<p class="text-xs text-gray-400">Available to play</p>
							</div>
							<Button onclick={() => goto("/browse/quizzes")} size="sm">Browse Quizzes</Button>
						</div>
					</CardContent>
				</Card>

				<Card class="border-gray-700 bg-gray-800/50">
					<CardHeader>
						<CardTitle class="flex items-center text-white">
							<Play class="mr-2 h-5 w-5 text-green-400" />
							Active Sessions
						</CardTitle>
						<CardDescription class="text-gray-300">Join live quiz sessions</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="flex items-center justify-between">
							<div>
								<div class="text-2xl font-bold text-white">{globalStats.activeSessions}</div>
								<p class="text-xs text-gray-400">Live right now</p>
							</div>
							<Button onclick={() => goto("/browse/sessions")} size="sm" variant="secondary">Join Session</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	</main>
</div>
