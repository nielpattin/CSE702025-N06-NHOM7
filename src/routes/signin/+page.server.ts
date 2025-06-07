import { signIn, providerMap } from "../../auth"
import type { Actions, PageServerLoad } from "./$types"

export const actions = { default: signIn } satisfies Actions

export const load: PageServerLoad = async () => {
	return {
		providerMap: providerMap
	}
}
