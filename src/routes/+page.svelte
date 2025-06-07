<script lang="ts">
	import { page } from "$app/state"
	import { signOut } from "@auth/sveltekit/client"
	import { goto } from "$app/navigation"

	let data = $derived(page.data)
	let session = $derived(data.session)
	let { userRole } = $derived(data)

	function handleSignIn() {
		goto("/signin")
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="SvelteKit authentication demo with Auth.js" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<!-- Header -->
	<header class="border-b border-gray-700 bg-gray-900 shadow-lg">
		<nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<!-- Logo -->
				<div class="flex items-center space-x-3">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg">
						<img src="/quiz-learn-logo.png" alt="Quiz Learn Logo" class="h-8 w-8 object-contain" />
					</div>
					<span class="text-xl font-semibold text-white">Quiz Learn</span>
				</div>

				<!-- Authentication Section -->
				<div class="flex items-center space-x-4">
					{#if session?.user}
						<!-- User info when authenticated -->
						<div class="flex items-center space-x-3">
							{#if session.user.image}
								<img src={session.user.image} alt="Profile" class="h-8 w-8 rounded-full ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900" />
							{/if}
							<span class="hidden text-sm text-gray-300 sm:block">
								{session.user.name || session.user.email}
							</span>
							<button onclick={() => signOut()} class="inline-flex cursor-pointer items-center rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 shadow-sm transition-colors hover:border-gray-500 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"> Sign Out </button>
						</div>
					{:else}
						<!-- Sign In button for non-authenticated users -->
						<button onclick={handleSignIn} class="inline-flex cursor-pointer items-center rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"> Sign In </button>
					{/if}
				</div>
			</div>
		</nav>
	</header>

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		{#if session?.user}
			<!-- Authenticated User View -->
			<div class="text-center">
				<!-- Welcome Section -->
				<div class="mb-8">
					<div class="mb-6 flex justify-center">
						{#if session.user.image}
							<img src={session.user.image} alt="Profile" class="h-24 w-24 rounded-full shadow-lg ring-4 ring-blue-400 ring-offset-4 ring-offset-gray-800" />
						{:else}
							<div class="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg ring-4 ring-blue-400 ring-offset-4 ring-offset-gray-800">
								<span class="text-2xl font-bold text-white">
									{session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
								</span>
							</div>
						{/if}
					</div>

					<h1 class="mb-2 text-4xl font-bold text-white">
						Hi, {session.user.name || "there"}! 👋
					</h1>

					<p class="mb-2 text-xl text-gray-300">Welcome back to your dashboard</p>

					<!-- Role Display -->
					<div class="mb-6 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium {userRole === 'Admin' ? 'bg-red-900 text-red-200' : 'bg-blue-900 text-blue-200'}">
						<span class="mr-2">
							{userRole === "Admin" ? "👑" : "🎓"}
						</span>
						Role: {userRole?.toUpperCase() || "USER"}
					</div>
				</div>

				<!-- Role-based Content -->
				<div class="grid gap-6 md:grid-cols-2">
					<!-- User Content -->
					<div class="rounded-lg bg-gray-800 p-6 shadow-lg">
						<h3 class="mb-3 text-xl font-semibold text-white">📝 User Features</h3>
						<p class="mb-4 text-gray-300">Access your quizzes and track your progress.</p>
						<ul class="space-y-2 text-sm text-gray-400">
							<li>• Take quizzes</li>
							<li>• View results</li>
							<li>• Track progress</li>
						</ul>
					</div>

					<!-- Admin Content (only visible to admins) -->
					{#if userRole === "Admin"}
						<div class="rounded-lg bg-gray-800 p-6 shadow-lg ring-2 ring-red-500">
							<h3 class="mb-3 text-xl font-semibold text-red-400">👑 Admin Features</h3>
							<p class="mb-4 text-gray-300">Full system administration and user management.</p>
							<ul class="mb-4 space-y-2 text-sm text-gray-400">
								<li>• Manage users</li>
								<li>• Assign roles</li>
								<li>• System settings</li>
								<li>• Analytics</li>
							</ul>
							<a href="/admin" class="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"> Open Admin Panel → </a>
						</div>
					{/if}
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
			</div>
		{/if}
	</main>
</div>
