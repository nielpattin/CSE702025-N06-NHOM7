<script>
	export let data

	$: dbStatus = data.dbStatus
</script>

<div class="container mx-auto p-8">
	<h1 class="mb-6 text-3xl font-bold">Welcome to Quiz Learn</h1>

	<!-- Database Connection Status -->
	<div class="mb-6 rounded-lg bg-white p-6 shadow-md">
		<h2 class="mb-4 text-2xl font-semibold">Database Connection Status</h2>

		<div class="space-y-4">
			<!-- Connection Status -->
			<div class="flex items-center space-x-3">
				<div class="flex-shrink-0">
					{#if dbStatus.connected}
						<div class="h-3 w-3 rounded-full bg-green-500"></div>
					{:else}
						<div class="h-3 w-3 rounded-full bg-red-500"></div>
					{/if}
				</div>
				<div>
					<p class="text-lg font-medium">
						Status: <span class={dbStatus.connected ? "text-green-600" : "text-red-600"}>
							{dbStatus.connected ? "Connected" : "Disconnected"}
						</span>
					</p>
					<p class="text-gray-600">{dbStatus.message}</p>
				</div>
			</div>

			<!-- Database Details -->
			{#if dbStatus.connected}
				<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="rounded bg-gray-50 p-4">
						<h3 class="font-semibold text-gray-800">User Table</h3>
						<p class="text-sm text-gray-600">
							Exists: <span class={dbStatus.userTableExists ? "text-green-600" : "text-red-600"}>
								{dbStatus.userTableExists ? "Yes" : "No"}
							</span>
						</p>
						<p class="text-sm text-gray-600">Records: {dbStatus.userCount}</p>
					</div>

					<div class="rounded bg-gray-50 p-4">
						<h3 class="font-semibold text-gray-800">Test Query</h3>
						<p class="text-sm text-gray-600">{dbStatus.testQuery?.query || "N/A"}</p>
						<p class="text-xs text-gray-500">
							Status: <span class="text-green-600">Success</span>
						</p>
					</div>
				</div>

				<!-- Sample Data -->
				{#if dbStatus.sampleData}
					<div class="mt-4 rounded bg-blue-50 p-4">
						<h3 class="mb-2 font-semibold text-blue-800">Sample User Data</h3>
						<pre class="overflow-x-auto text-sm text-blue-700">{JSON.stringify(
								dbStatus.sampleData,
								null,
								2
							)}</pre>
					</div>
				{:else if dbStatus.userTableExists}
					<div class="mt-4 rounded bg-yellow-50 p-4">
						<p class="text-yellow-800">User table exists but contains no data</p>
					</div>
				{/if}
			{:else}
				<!-- Error Details -->
				<div class="mt-4 rounded bg-red-50 p-4">
					<h3 class="mb-2 font-semibold text-red-800">Error Details</h3>
					<p class="text-sm text-red-700">{dbStatus.error}</p>
				</div>
			{/if}

			<!-- Timestamp -->
			<div class="mt-4 text-xs text-gray-500">
				Last checked: {new Date(dbStatus.timestamp).toLocaleString()}
			</div>
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
	}
</style>
