import { SvelteKitAuth } from "@auth/sveltekit"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "$lib/server/db"
import * as schema from "$lib/server/db/schema"
import { DEFAULT_ROLE } from "$lib/server/role-utils"
import GitHub from "@auth/sveltekit/providers/github"
import Google from "@auth/sveltekit/providers/google"
import type { Provider } from "@auth/sveltekit/providers"

export const providers: Provider[] = [
	GitHub({
		allowDangerousEmailAccountLinking: true,
		profile(profile) {
			return {
				id: profile.id.toString(),
				name: profile.name || profile.login,
				email: profile.email,
				image: profile.avatar_url,
				role: DEFAULT_ROLE
			}
		}
	}),
	Google({
		allowDangerousEmailAccountLinking: true,
		profile(profile) {
			return {
				id: profile.sub,
				name: profile.name,
				email: profile.email,
				image: profile.picture,
				role: DEFAULT_ROLE
			}
		}
	})
]

export const providerMap = providers.map((provider) => {
	if (typeof provider === "function") {
		const providerData = provider()
		return { id: providerData.id, name: providerData.name }
	} else {
		return { id: provider.id, name: provider.name }
	}
})

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: DrizzleAdapter(db, {
		usersTable: schema.users,
		accountsTable: schema.accounts
	}),
	providers,
	pages: {
		signIn: "/signin"
	},
	callbacks: {
		signIn() {
			return true
		},
		session({ session, user }) {
			session.user.role = user.role
			return session
		},
		redirect({ url, baseUrl }) {
			try {
				let redirectUrl = baseUrl

				// Parse the URL to check for a callbackUrl, especially if it's the sign-in page
				try {
					const parsedUrl = new URL(url)

					if (parsedUrl.pathname === "/signin") {
						const callbackUrlParam = parsedUrl.searchParams.get("callbackUrl")
						if (callbackUrlParam) {
							// Ensure the extracted callbackUrl is also from the same origin
							try {
								const decodedCallbackUrl = decodeURIComponent(callbackUrlParam)
								const parsedCallbackUrl = new URL(decodedCallbackUrl)
								if (parsedCallbackUrl.origin === baseUrl) {
									redirectUrl = decodedCallbackUrl
								}
							} catch (e) {
								// Error parsing callbackUrlParam, using baseUrl
							}
						}
					} else if (parsedUrl.origin === baseUrl) {
						// If it's not the sign-in page, but same origin, use the URL as is
						redirectUrl = url
					}
				} catch (e) {
					// URL parsing failed for main URL, using baseUrl
				}

				return redirectUrl
			} catch (error) {
				return baseUrl
			}
		}
	}
})
