<script lang="ts">
	import { Skeleton } from "$lib/components/ui/skeleton"
	import { Card } from "$lib/components/ui/card"
</script>

<Card class="group cursor-pointer border-gray-700 bg-gray-800/50 p-3">
	<div class="flex items-center justify-between gap-2">
		<h3 class="flex-1 truncate text-sm font-medium">
			<Skeleton class="h-5 w-3/4 bg-gray-600" />
		</h3>
		<div class="flex flex-shrink-0 items-center gap-0.5">
			<Skeleton class="h-2.5 w-2.5 bg-gray-600" />
			<Skeleton class="h-3 w-4 bg-gray-600" />
		</div>
	</div>

	<div class="flex items-center justify-between text-xs">
		<Skeleton class="h-3 w-20 bg-gray-600" />
		<div class="flex items-center gap-1">
			<Skeleton class="h-5 w-16 rounded-full bg-gray-600" />
			<Skeleton class="h-3 w-8 bg-gray-600" />
			<Skeleton class="h-3 w-8 bg-gray-600" />
		</div>
	</div>

	<div class="text-xs leading-none">
		<Skeleton class="h-3 w-16 bg-gray-600" />
	</div>
</Card>
