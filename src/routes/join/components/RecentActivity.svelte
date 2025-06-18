<script lang="ts">
	import Badge from "$lib/components/ui/badge/badge.svelte"
	import * as Carousel from "$lib/components/ui/carousel"
	import * as Card from "$lib/components/ui/card"
	import Autoplay from "embla-carousel-autoplay"
	import { Button } from "$lib/components/ui/button"
	import CodeCopy from "$lib/components/ui/code/CodeCopy.svelte"
	import { Clock, Users, Hash, Check } from "@lucide/svelte"
	import { goto } from "$app/navigation"

	type RecentSession = {
		id: number
		code: string
		status: string
		createdAt: Date
		quizTitle: string | null
		participantCount: number
	}

	const { sessions = [] }: { sessions?: RecentSession[] } = $props()

	function getTimeAgo(date: Date) {
		const now = new Date()
		const diffTime = now.getTime() - date.getTime()
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
		const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
		const diffMinutes = Math.floor(diffTime / (1000 * 60))

		if (diffDays > 0) {
			return `${diffDays}d ago`
		} else if (diffHours > 0) {
			return `${diffHours}h ago`
		} else if (diffMinutes > 0) {
			return `${diffMinutes}m ago`
		} else {
			return "now"
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case "active":
				return "Active"
			case "inactive":
				return "Waiting"
			case "completed":
				return "Completed"
			default:
				return "Unknown"
		}
	}

	function handleCardClick(sessionId: number) {
		goto(`/play/session/${sessionId}`)
	}
</script>

<div class="space-y-4">
	<div>
		<h3 class="text-xl font-semibold tracking-tight">Recent Sessions</h3>
		<p class="text-muted-foreground text-sm">Latest quiz sessions from the community</p>
	</div>

	{#if sessions.length === 0}
		<Card.Root>
			<Card.Content class="p-8">
				<div class="text-muted-foreground text-center">
					<p>No recent sessions found.</p>
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<Carousel.Root
			opts={{
				align: "start",
				loop: false
			}}
			plugins={[
				Autoplay({
					delay: 2000
				})
			]}
			class="w-full"
		>
			<Carousel.Content class="-ml-4">
				{#each sessions as session (session.id)}
					<Carousel.Item class="pl-4 md:basis-1/2 lg:basis-1/3">
						<Card.Root class="flex h-full flex-col">
							<Card.Header>
								<Card.Title class="flex items-center justify-between">
									<span class="truncate">{session.quizTitle || "Unknown Quiz"}</span>
									<Badge variant="secondary">{getStatusText(session.status)}</Badge>
								</Card.Title>
								<Card.Description class="flex items-center gap-2 pt-2">
									<Hash class="h-4 w-4" />
									<CodeCopy code={session.code} inline={true} />
								</Card.Description>
							</Card.Header>
							<Card.Content class="flex-grow">
								<div class="text-muted-foreground flex items-center justify-between text-sm">
									<div class="flex items-center gap-2">
										<Users class="h-4 w-4" />
										<span class="text-foreground font-medium">{session.participantCount}</span>
										<span>participant{session.participantCount === 1 ? "" : "s"}</span>
									</div>
									<div class="flex items-center gap-2">
										<Clock class="h-4 w-4" />
										<span>{getTimeAgo(session.createdAt)}</span>
									</div>
								</div>
							</Card.Content>
							<Card.Footer>
								<Button class="w-full cursor-pointer" onclick={() => handleCardClick(session.id)}>Join Session</Button>
							</Card.Footer>
						</Card.Root>
					</Carousel.Item>
				{/each}
			</Carousel.Content>
			<Carousel.Previous />
			<Carousel.Next />
		</Carousel.Root>
	{/if}
</div>
