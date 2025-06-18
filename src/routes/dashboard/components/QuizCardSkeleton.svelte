<script lang="ts">
	import { Skeleton } from "$lib/components/ui/skeleton"
	import { Card } from "$lib/components/ui/card"
</script>

<Card class="group border-border bg-card cursor-pointer p-3">
	<div class="flex items-center justify-between gap-2">
		<h3 class="flex-1 truncate text-sm font-medium">
			<Skeleton class="bg-muted h-5 w-3/4" />
		</h3>
		<div class="flex flex-shrink-0 items-center gap-0.5">
			<Skeleton class="bg-muted h-2.5 w-2.5" />
			<Skeleton class="bg-muted h-3 w-4" />
		</div>
	</div>

	<div class="flex items-center justify-between text-xs">
		<Skeleton class="bg-muted h-3 w-20" />
		<div class="flex items-center gap-1">
			<Skeleton class="bg-muted h-5 w-16 rounded-full" />
			<Skeleton class="bg-muted h-3 w-8" />
			<Skeleton class="bg-muted h-3 w-8" />
		</div>
	</div>

	<div class="text-xs leading-none">
		<Skeleton class="bg-muted h-3 w-16" />
	</div>
</Card>
