<script lang="ts">
	import { enhance } from "$app/forms"
	import { page } from "$app/state"
	import type { PageData, ActionData } from "./$types"

	let { data }: { data: PageData } = $props()
	let actionData: ActionData = $derived(page.form)
</script>

<svelte:head>
	<title>Admin Panel - User Management</title>
</svelte:head>

<div class="bg-background min-h-screen">
	<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-white">👑 Admin Panel</h1>
			<p class="mt-2 text-gray-300">Manage user roles and permissions</p>
		</div>

		<!-- Action Result -->
		{#if actionData}
			<div class="mb-6 rounded-md p-4 {actionData.success ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}">
				{actionData.success ? "User role updated successfully!" : actionData.body || "An error occurred"}
			</div>
		{/if}

		<!-- Users Table -->
		<div class="bg-secondary overflow-hidden rounded-lg shadow">
			<div class="border-border border-b px-6 py-4">
				<h2 class="text-xl font-semibold text-white">User Management</h2>
			</div>
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-700">
					<thead class="bg-muted">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"> User </th>
							<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"> Email </th>
							<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"> Current Role </th>
							<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase"> Actions </th>
						</tr>
					</thead>
					<tbody class="bg-secondary divide-y divide-gray-700">
						{#each data.users as user (user.id)}
							<tr class="hover:bg-muted">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										{#if user.image}
											<img class="h-10 w-10 rounded-full" src={user.image} alt="" />
										{:else}
											<div class="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
												<span class="text-sm font-medium text-white">
													{user.name?.charAt(0) || user.email?.charAt(0) || "U"}
												</span>
											</div>
										{/if}
										<div class="ml-4">
											<div class="text-sm font-medium text-white">{user.name || "Unknown"}</div>
											<div class="text-sm text-gray-400">{user.id}</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-300">
									{user.email || "No email"}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex rounded-full px-2 text-xs leading-5 font-semibold {user.role === 'Admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}">
										{user.role === "Admin" ? "👑" : "🎓"}
										{user.role?.toUpperCase() || "USER"}
									</span>
								</td>
								<td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
									<form method="POST" action="?/updateUserRole" use:enhance>
										<input type="hidden" name="userId" value={user.id} />
										<select name="role" class="border-border bg-muted mr-2 rounded border px-2 py-1 text-sm text-white" value={user.role}>
											<option value="Admin">👑 Admin</option>
											<option value="User">🎓 User</option>
										</select>
										<button type="submit" class="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"> Update </button>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Back to Home -->
		<div class="mt-8">
			<a href="/" class="border-border bg-secondary hover:bg-muted inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium text-gray-200"> ← Back to Home </a>
		</div>
	</div>
</div>
