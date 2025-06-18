<script lang="ts">
	import { page } from "$app/state"
	import { signOut } from "@auth/sveltekit/client"
	import { goto } from "$app/navigation"

	let data = $derived(page.data)
	let session = $derived(data.session)
	let { userRole } = $derived(data)

	// State for burger menu
	let burgerMenuOpen = $state(false)
	let joinCode = $state("")
	let searchQuery = $state("")

	// Mock recent activity data
	let recentActivity = $state([
		{ id: 1, title: "JavaScript Fundamentals", date: "2 hours ago", status: "completed", score: 95 },
		{ id: 2, title: "React Basics", date: "1 day ago", status: "completed", score: 87 },
		{ id: 3, title: "CSS Grid Layout", date: "3 days ago", status: "completed", score: 92 },
		{ id: 4, title: "Node.js Essentials", date: "1 week ago", status: "in-progress", score: null }
	])

	function handleSignIn() {
		goto("/signin")
	}

	function handleJoinQuiz() {
		if (joinCode.trim()) {
			// TODO: Implement join quiz logic
			console.log("Joining quiz with code:", joinCode)
		}
	}

	function handleSearchQuiz() {
		if (searchQuery.trim()) {
			// TODO: Implement search logic
			console.log("Searching for:", searchQuery)
		}
	}

	function goToDashboard() {
		goto("/dashboard")
	}

	function handleSettings() {
		// TODO: Implement settings navigation
		console.log("Navigate to settings")
		burgerMenuOpen = false
	}

	function handleLogout() {
		signOut()
		burgerMenuOpen = false
	}

	function closeBurgerMenu() {
		burgerMenuOpen = false
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="SvelteKit authentication demo with Auth.js" />
</svelte:head>

<div class="bg-background min-h-screen">
	<!-- Header -->
	<header class="border-border bg-secondary border-b shadow-lg">
		<nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<!-- Logo and Search Section -->
				<div class="flex items-center space-x-6">
					<!-- Logo -->
					<div class="flex items-center space-x-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-lg">
							<img src="/quiz-learn-logo.png" alt="Quiz Learn Logo" class="h-8 w-8 object-contain" />
						</div>
						<span class="text-xl font-semibold text-white">Quiz Learn</span>
					</div>

					{#if session?.user}
						<!-- Find a quiz search bar and Dashboard button (only for authenticated users) -->
						<div class="hidden items-center space-x-4 md:flex">
							<div class="relative">
								<input type="text" placeholder="Find a quiz" bind:value={searchQuery} onkeydown={(e) => e.key === "Enter" && handleSearchQuiz()} class="border-border bg-muted w-64 rounded-md border px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
								<button onclick={handleSearchQuiz} aria-label="Search Quiz" class="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-white">
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
								</button>
							</div>
							<button onclick={goToDashboard} class="inline-flex items-center rounded-md border border-transparent bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"> Dashboard </button>
						</div>
					{/if}
				</div>

				<!-- Right Side Actions -->
				<div class="flex items-center space-x-4">
					{#if session?.user}
						<!-- Burger Menu for authenticated users -->
						<div class="relative">
							<button onclick={() => (burgerMenuOpen = !burgerMenuOpen)} class="hover:bg-muted focus:bg-muted inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-white focus:text-white focus:outline-none" aria-expanded="false">
								<span class="sr-only">Open main menu</span>
								<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
								</svg>
							</button>

							<!-- Burger Menu Dropdown -->
							{#if burgerMenuOpen}
								<div class="ring-opacity-5 bg-secondary absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md py-1 shadow-lg ring-1 ring-black focus:outline-none">
									<button onclick={handleSettings} class="hover:bg-muted block w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white"> Settings </button>
									<button onclick={handleLogout} class="hover:bg-muted block w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white"> Logout </button>
								</div>
							{/if}
						</div>

						<!-- User info (hidden on mobile to save space) -->
						<div class="hidden items-center space-x-3 lg:flex">
							{#if session.user.image}
								<img src={session.user.image} alt="Profile" class="h-8 w-8 rounded-full ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900" />
							{/if}
							<span class="text-sm text-gray-300">
								{session.user.name || session.user.email}
							</span>
						</div>
					{:else}
						<!-- Sign In button for non-authenticated users -->
						<button onclick={handleSignIn} class="inline-flex cursor-pointer items-center rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"> Sign In </button>
					{/if}
				</div>
			</div>
		</nav>
	</header>

	<!-- Click outside to close burger menu -->
	{#if burgerMenuOpen}
		<div class="fixed inset-0 z-5" role="button" tabindex="0" onclick={closeBurgerMenu} onkeydown={(e) => (e.key === "Enter" || e.key === " ") && closeBurgerMenu()}></div>
	{/if}

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<div class="space-y-8">
			{#if session?.user}
				<!-- Authenticated User Dashboard -->
				<div class="space-y-8">
					<!-- Enter Code to Join Section - Centered -->
					<div class="text-center">
						<div class="mx-auto max-w-md">
							<div class="border-border bg-card rounded-lg border p-8 shadow-xl">
								<div class="mb-6">
									<h2 class="mb-2 text-2xl font-bold text-white">Enter code to join</h2>
									<p class="text-sm text-gray-400">Have a quiz code? Enter it below to join instantly</p>
								</div>
								<div class="space-y-4">
									<input type="text" placeholder="Enter join code" bind:value={joinCode} onkeydown={(e) => e.key === "Enter" && handleJoinQuiz()} class="border-border bg-muted w-full rounded-lg border px-4 py-3 text-center text-lg tracking-wider text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
									<button onclick={handleJoinQuiz} disabled={!joinCode.trim()} class="w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-lg font-medium text-white transition-all hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"> Join Quiz </button>
								</div>
							</div>
						</div>
					</div>

					<!-- Dashboard Content -->
					<div class="grid gap-6 lg:grid-cols-2">
						<!-- Quick Stats Card -->
						<div class="border-border bg-card rounded-lg border p-6 shadow-lg">
							<h3 class="mb-4 text-xl font-semibold text-white">📊 Quick Stats</h3>
							<div class="space-y-3 text-sm text-gray-300">
								<div class="flex items-center justify-between">
									<span>Quizzes Taken:</span>
									<span class="text-lg font-bold text-white">12</span>
								</div>
								<div class="flex items-center justify-between">
									<span>Average Score:</span>
									<span class="text-lg font-bold text-green-400">85%</span>
								</div>
								<div class="flex items-center justify-between">
									<span>This Week:</span>
									<span class="text-lg font-bold text-blue-400">3 quizzes</span>
								</div>
							</div>
						</div>

						<!-- Recent Activity Card -->
						<div class="border-border bg-card rounded-lg border p-6 shadow-lg">
							<h3 class="mb-4 text-xl font-semibold text-white">🕒 Recent Activity</h3>
							<div class="space-y-3">
								{#each recentActivity as activity (activity.id)}
									<div class="bg-muted hover:bg-muted flex items-center justify-between rounded-lg p-3 transition-colors">
										<div class="flex items-center space-x-3">
											<span class="h-3 w-3 rounded-full {activity.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400'}"></span>
											<div>
												<p class="text-sm font-medium text-white">{activity.title}</p>
												<p class="text-xs text-gray-400">{activity.date}</p>
											</div>
										</div>
										<div class="text-right">
											{#if activity.score !== null}
												<span class="text-sm font-bold text-green-400">{activity.score}%</span>
											{:else}
												<span class="text-xs text-yellow-400">In Progress</span>
											{/if}
										</div>
									</div>
								{/each}
							</div>
							<div class="border-border mt-4 border-t pt-4">
								<button class="text-sm font-medium text-blue-400 hover:text-blue-300"> View all activity → </button>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<!-- Non-authenticated User View -->
				<div class="text-center">
					<!-- Hero Section -->
					<div class="mb-12">
						<div class="mb-8 flex justify-center">
							<div class="flex h-32 w-32 items-center justify-center rounded-2xl shadow-2xl">
								<img src="/quiz-learn-logo.png" alt="Quiz Learn Logo" class="h-32 w-32 object-contain" />
							</div>
						</div>

						<h1 class="mb-6 text-5xl font-bold text-white">
							Welcome to <span class="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Quiz Learn</span>
						</h1>

						<p class="mb-8 text-xl text-gray-300">Please sign in to access your personalized learning experience</p>
					</div>

					<!-- Enter Code to Join Section for Non-authenticated Users -->
					<div class="mx-auto max-w-md">
						<div class="border-border bg-card rounded-lg border p-8 shadow-xl">
							<div class="mb-6">
								<h2 class="mb-2 text-2xl font-bold text-white">Enter code to join</h2>
								<p class="text-sm text-gray-400">Have a quiz code? You can join without signing up!</p>
							</div>
							<div class="space-y-4">
								<input type="text" placeholder="Enter join code" bind:value={joinCode} onkeydown={(e) => e.key === "Enter" && handleJoinQuiz()} class="border-border bg-muted w-full rounded-lg border px-4 py-3 text-center text-lg tracking-wider text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
								<button onclick={handleJoinQuiz} disabled={!joinCode.trim()} class="w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-lg font-medium text-white transition-all hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"> Join Quiz </button>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</main>
</div>
