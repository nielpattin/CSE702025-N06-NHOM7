<script lang="ts">
	import { Skeleton } from "$lib/components/ui/skeleton"
</script>

<div class="rounded-lg border border-gray-700 bg-gray-700/50 p-4">
	<div class="mb-3 flex items-start justify-between">
		<div class="flex-1">
			<Skeleton class="mb-2 h-5 w-3/4 bg-gray-600" />
			<Skeleton class="h-4 w-1/2 bg-gray-600" />
		</div>
		<div class="flex items-center">
			<Skeleton class="h-4 w-12 bg-gray-600" />
		</div>
	</div>

	<div class="mb-3 flex flex-wrap gap-2">
		<Skeleton class="h-6 w-20 rounded-full bg-gray-600" />
		<Skeleton class="h-6 w-16 rounded-full bg-gray-600" />
	</div>

	<div class="flex items-center justify-between">
		<Skeleton class="h-4 w-24 bg-gray-600" />
		<Skeleton class="h-8 w-20 rounded-md bg-gray-600" />
	</div>
</div>
