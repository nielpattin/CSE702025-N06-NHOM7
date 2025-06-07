<script lang="ts">
	import { SignIn } from "@auth/sveltekit/components"

	let { data } = $props()
	const { providerMap } = data
</script>

<svelte:head>
	<title>Sign In - Quiz Learn</title>
	<meta name="description" content="Sign in to Quiz Learn - Your learning journey starts here" />
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

				<!-- Back to Home Link -->
				<div class="flex items-center">
					<a href="/" class="inline-flex cursor-pointer items-center rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 shadow-sm transition-colors hover:border-gray-500 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none">
						<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
						Back to Home
					</a>
				</div>
			</div>
		</nav>
	</header>

	<!-- Main Content -->
	<main class="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
		<div class="text-center">
			<!-- Logo Section -->
			<div class="mb-8 flex justify-center">
				<div class="flex h-20 w-20 items-center justify-center rounded-2xl shadow-2xl">
					<img src="/quiz-learn-logo.png" alt="Quiz Learn Logo" class="h-20 w-20 object-contain" />
				</div>
			</div>

			<!-- Sign In Card -->
			<div class="rounded-lg border border-gray-600 bg-gray-800 p-8 shadow-xl">
				<!-- Header -->
				<div class="mb-6">
					<h2 class="mb-2 text-3xl font-bold text-white">Welcome Back</h2>
					<p class="text-gray-300">Sign in to continue your learning journey</p>
				</div>

				<!-- Sign In Providers -->
				<div class="space-y-3">
					{#each providerMap as provider (provider.id)}
						<SignIn provider={provider.id} signInPage="signin" className="w-full">
							<div slot="submitButton" class="group relative flex w-full transform cursor-pointer items-center justify-center rounded-lg border border-gray-600 bg-gray-700 px-6 py-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:border-gray-500 hover:bg-gray-600 hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none">
								<!-- Provider Icon -->
								<div class="mr-3 flex h-5 w-5 items-center justify-center">
									{#if provider.id === "google"}
										<img src="/google.svg" alt="Google" class="h-5 w-5" />
									{:else if provider.id === "github"}
										<img src="/github.svg" alt="GitHub" class="h-5 w-5 text-white" />
									{/if}
								</div>

								<!-- Provider Text -->
								<span class="flex-1 text-center">
									Continue with {provider.name}
								</span>

								<!-- Arrow Icon -->
								<div class="ml-3 flex h-5 w-5 items-center justify-center opacity-60 transition-opacity group-hover:opacity-100">
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
									</svg>
								</div>
							</div>
						</SignIn>
					{/each}
				</div>

				<!-- Footer Text -->
				<div class="mt-6 border-t border-gray-600 pt-6">
					<p class="text-center text-xs text-gray-400">
						By signing in, you agree to our
						<a href="/" class="cursor-pointer text-blue-400 transition-colors hover:text-blue-300">Terms of Service</a>
						and
						<a href="/" class="cursor-pointer text-blue-400 transition-colors hover:text-blue-300">Privacy Policy</a>
					</p>
				</div>
			</div>
		</div>
	</main>
</div>
