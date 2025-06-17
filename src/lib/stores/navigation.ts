import { writable } from "svelte/store"

interface NavigationState {
	isLoading: boolean
	loadingRoute: string | null
}

function createNavigationStore() {
	const { subscribe, set, update } = writable<NavigationState>({
		isLoading: false,
		loadingRoute: null
	})

	return {
		subscribe,
		startLoading: (route: string) => {
			update((state) => ({
				...state,
				isLoading: true,
				loadingRoute: route
			}))
		},
		stopLoading: () => {
			set({
				isLoading: false,
				loadingRoute: null
			})
		},
		reset: () =>
			set({
				isLoading: false,
				loadingRoute: null
			})
	}
}

export const navigationStore = createNavigationStore()
