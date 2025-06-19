<script lang="ts">
	import { Heading, P } from "flowbite-svelte"
	import QuizBadges from "./QuizBadges.svelte"
	import QuizStats from "./QuizStats.svelte"
	import QuizActions from "./QuizActions.svelte"
	import type { PageData } from "../$types"

	let { data } = $props<{ data: PageData }>()
</script>

<div class="border-border bg-card hover:bg-secondary/70 rounded-lg border p-6 backdrop-blur transition-all" style="background-color: var(--card) !important;">
	<div class="flex items-start space-x-6">
		<!-- Quiz Image Placeholder -->
		<div class="flex-shrink-0">
			<div class="relative h-28 w-28 overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
				<img src={data.quiz.imageUrl || `https://picsum.photos/seed/${data.quiz.id || data.quiz.title || "quiz"}/400/200`} alt={data.quiz.title || "Quiz"} class="h-full w-full object-cover" />
			</div>
		</div>

		<!-- Quiz Information -->
		<div class="min-w-0 flex-1">
			<div class="flex items-start justify-between">
				<div>
					<!-- Title and Author -->
					<div class="mb-4">
						<div class="mb-2 flex items-center gap-3">
							<Heading tag="h1" class="text-foreground text-3xl font-bold">
								{data.quiz.title || "Untitled Quiz"}
							</Heading>
							<div class="flex items-center gap-1">
								<svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
								<span class="text-foreground text-lg font-semibold">
									{data.quiz.rating?.toFixed(1) || "N/A"}
								</span>
							</div>
						</div>
						{#if data.quiz.creator}
							<P class="text-muted-foreground">by {data.quiz.creator.name}</P>
						{/if}
					</div>

					<!-- Description -->
					{#if data.quiz.description}
						<div class="mb-6">
							<Heading tag="h3" class="text-foreground mb-2 text-lg font-semibold">Description</Heading>
							<P class="text-muted-foreground">{data.quiz.description}</P>
						</div>
					{/if}
				</div>

				<!-- Badges and Stats -->
				<div class="flex h-full min-h-[200px] flex-col items-end justify-between">
					<div class="flex flex-col items-end gap-3">
						<QuizBadges quiz={data.quiz} />
						<QuizStats quiz={data.quiz} />
					</div>
					<QuizActions quiz={data.quiz} isOwner={data.isOwner} />
				</div>
			</div>
		</div>
	</div>
</div>
