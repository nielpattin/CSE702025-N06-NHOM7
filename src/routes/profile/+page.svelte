<script lang="ts">
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { Card, CardContent } from "$lib/components/ui/card"
	import { Button } from "$lib/components/ui/button"
	import { Badge } from "$lib/components/ui/badge"
	import { User, Share, Edit, Trophy, BookOpen } from "@lucide/svelte"

	let { data } = $props()
</script>

<svelte:head>
	<title>Profile - Quiz Learn</title>
	<meta name="description" content="Your Quiz Learn profile" />
</svelte:head>

<div class="bg-background min-h-screen">
	<AppHeader title="Profile" />
	<main class="mx-auto max-w-6xl px-6 py-12">
		<Card class="shadow-2xl">
			<CardContent class="p-8">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-6">
						<!-- Avatar Section -->
						<div class="h-28 w-28 flex-shrink-0">
							{#if data.session.user?.image}
								<img src={data.session.user.image} alt="Profile" class="border-border h-28 w-28 rounded-full border-4 object-cover shadow-lg" />
							{:else}
								<div class="border-border bg-muted flex h-28 w-28 items-center justify-center rounded-full border-4 shadow-lg">
									<User class="text-muted-foreground h-14 w-14" />
								</div>
							{/if}
						</div>

						<!-- User Info Section -->
						<div class="flex flex-col space-y-2">
							<div class="flex items-center space-x-3">
								<h2 class="text-card-foreground text-3xl font-bold">
									{data.session.user?.name || "User"}
								</h2>
							</div>
							<p class="text-muted-foreground text-sm">
								@{data.session.user?.email || "user@example.com"}
							</p>
						</div>
					</div>

					<!-- Actions and Stats Section -->
					<div class="flex flex-col items-end space-y-6">
						<!-- Action Buttons -->
						<div class="flex space-x-3">
							<Button variant="outline" size="sm">
								<Share class="mr-2 h-4 w-4" />
								Share Profile
							</Button>
							<Button variant="outline" size="sm" href="/profile/edit">
								<Edit class="mr-2 h-4 w-4" />
								Edit Profile
							</Button>
						</div>

						<!-- Stats Section -->
						<div class="flex space-x-8">
							<div class="text-center">
								<div class="text-card-foreground text-2xl font-bold">
									{data.quizCount[0]?.value || 0}
								</div>
								<Badge variant="secondary" class="text-xs">
									<Trophy class="mr-1 h-3 w-3" />
									Quizzes
								</Badge>
							</div>
							<div class="text-center">
								<div class="text-card-foreground text-2xl font-bold">
									{data.collectionsCount}
								</div>
								<Badge variant="secondary" class="text-xs">
									<BookOpen class="mr-1 h-3 w-3" />
									Collections
								</Badge>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	</main>
</div>
