import { handle as authHandle } from "./auth"
import type { Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
	const result = await authHandle({ event, resolve })
	return result
}
