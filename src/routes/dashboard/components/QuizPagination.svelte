<script lang="ts">
	import { page } from "$app/state"
	import { goto } from "$app/navigation"
	import * as Pagination from "$lib/components/ui/pagination"

	interface PaginationInfo {
		currentPage: number
		perPage: number
		totalQuizzes: number
		totalPages: number
	}

	interface Props {
		pagination: PaginationInfo
	}

	let { pagination }: Props = $props()

	function updateUrl(params: Record<string, string | number> = {}) {
		const url = new URL(page.url)

		if ("page" in params) {
			const pageNum = Number(params.page)
			if (pageNum && pageNum > 1) {
				url.searchParams.set("page", String(pageNum))
			} else {
				url.searchParams.delete("page")
			}
		}

		goto(url.toString(), { replaceState: false, noScroll: false, invalidateAll: true })
	}

	async function handlePageChange(newPage: number) {
		window.scrollTo({ top: 0, behavior: "smooth" })
		updateUrl({ page: newPage })
	}
</script>

{#if pagination.totalPages > 1}
	<div class="flex justify-center">
		<Pagination.Root count={pagination.totalQuizzes} perPage={pagination.perPage} page={pagination.currentPage} onPageChange={handlePageChange}>
			{#snippet children({ pages, currentPage: paginationCurrentPage })}
				<Pagination.Content>
					<Pagination.Item class="cursor-pointer">
						<Pagination.PrevButton />
					</Pagination.Item>
					{#each pages as page (page.key)}
						{#if page.type === "ellipsis"}
							<Pagination.Item>
								<Pagination.Ellipsis />
							</Pagination.Item>
						{:else}
							<Pagination.Item>
								<Pagination.Link class="cursor-pointer" {page} isActive={paginationCurrentPage === page.value}>
									{page.value}
								</Pagination.Link>
							</Pagination.Item>
						{/if}
					{/each}
					<Pagination.Item>
						<Pagination.NextButton class="cursor-pointer" />
					</Pagination.Item>
				</Pagination.Content>
			{/snippet}
		</Pagination.Root>
	</div>
{/if}
