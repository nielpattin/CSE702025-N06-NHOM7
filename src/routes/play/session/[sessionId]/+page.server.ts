import { error, fail, redirect } from "@sveltejs/kit"
import { db } from "$lib/server/db/index.js"
import { quizSessions, quizzes, sessionParticipants, users, gameAttempts } from "$lib/server/db/schema.js"
import { eq, and } from "drizzle-orm"
import type { PageServerLoad, Actions } from "./$types.js"

export const load: PageServerLoad = async ({ params, locals }) => {
	const sessionId = parseInt(params.sessionId)

	if (isNaN(sessionId)) {
		throw error(404, "Session not found")
	}

	// Fetch session details with quiz information
	const sessionResult = await db
		.select({
			id: quizSessions.id,
			code: quizSessions.code,
			status: quizSessions.status,
			expiresAt: quizSessions.expiresAt,
			createdAt: quizSessions.createdAt,
			hostId: quizSessions.hostId,
			quiz: {
				id: quizzes.id,
				title: quizzes.title,
				description: quizzes.description
			}
		})
		.from(quizSessions)
		.innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
		.where(eq(quizSessions.id, sessionId))
		.limit(1)

	if (sessionResult.length === 0) {
		throw error(404, "Session not found")
	}

	const session = sessionResult[0]

	// Fetch participants for this session
	const participants = await db
		.select({
			id: sessionParticipants.id,
			name: sessionParticipants.name,
			userId: sessionParticipants.userId,
			createdAt: sessionParticipants.createdAt,
			user: {
				name: users.name,
				image: users.image
			}
		})
		.from(sessionParticipants)
		.leftJoin(users, eq(sessionParticipants.userId, users.id))
		.where(eq(sessionParticipants.quizSessionId, sessionId))
		.orderBy(sessionParticipants.createdAt)

	return {
		session,
		participants,
		userSession: await locals.auth()
	}
}

export const actions: Actions = {
	joinSession: async ({ request, params, locals }) => {
		const sessionId = parseInt(params.sessionId)

		if (isNaN(sessionId)) {
			return fail(400, { error: "Invalid session ID" })
		}

		const formData = await request.formData()
		const name = formData.get("name")?.toString()
		const guestId = formData.get("guestId")?.toString()

		try {
			// Check if session exists and is active
			const sessionResult = await db.select({ id: quizSessions.id, status: quizSessions.status }).from(quizSessions).where(eq(quizSessions.id, sessionId)).limit(1)

			if (sessionResult.length === 0) {
				return fail(404, { error: "Session not found" })
			}

			const session = sessionResult[0]
			if (session.status !== "active") {
				return fail(400, { error: "Session is not active" })
			}

			// Handle authenticated users
			const authSession = await locals.auth()
			let participantId: number

			if (authSession?.user) {
				// Check if user has already joined this session
				const existingParticipant = await db
					.select({ id: sessionParticipants.id })
					.from(sessionParticipants)
					.where(and(eq(sessionParticipants.quizSessionId, sessionId), eq(sessionParticipants.userId, authSession.user.id)))
					.limit(1)

				if (existingParticipant.length > 0) {
					// User has already joined, check if they have an active attempt
					const existingAttempt = await db
						.select({ id: gameAttempts.id })
						.from(gameAttempts)
						.where(and(eq(gameAttempts.quizSessionId, sessionId), eq(gameAttempts.participantId, existingParticipant[0].id), eq(gameAttempts.status, "in_progress")))
						.limit(1)

					if (existingAttempt.length > 0) {
						// Redirect to existing attempt
						throw redirect(302, `/play/session/${sessionId}/${existingAttempt[0].id}`)
					} else {
						// Create new attempt for existing participant
						const newAttempt = await db
							.insert(gameAttempts)
							.values({
								quizSessionId: sessionId,
								participantId: existingParticipant[0].id,
								attemptNumber: 1,
								status: "in_progress",
								startedAt: new Date()
							})
							.returning({ id: gameAttempts.id })

						throw redirect(302, `/play/session/${sessionId}/${newAttempt[0].id}`)
					}
				}

				// Validate and process the display name for authenticated users
				let displayName: string | null = null
				if (name && name.trim() !== "") {
					const trimmedName = name.trim()
					if (trimmedName.length > 100) {
						return fail(400, { error: "Name must be 100 characters or less" })
					}
					displayName = trimmedName
				}

				// Add authenticated user to participants
				const participant = await db
					.insert(sessionParticipants)
					.values({
						quizSessionId: sessionId,
						userId: authSession.user.id,
						name: displayName // store custom display name if provided
					})
					.returning({ id: sessionParticipants.id })

				participantId = participant[0].id
			} else {
				// Handle guest users
				if (!name || name.trim() === "") {
					return fail(400, { error: "Name is required for guest users" })
				}

				const trimmedName = name.trim()
				if (trimmedName.length > 100) {
					return fail(400, { error: "Name must be 100 characters or less" })
				}

				// Check if guest user has already joined this session
				if (guestId) {
					const existingGuestParticipant = await db
						.select({ id: sessionParticipants.id })
						.from(sessionParticipants)
						.where(and(eq(sessionParticipants.quizSessionId, sessionId), eq(sessionParticipants.guestId, guestId)))
						.limit(1)

					if (existingGuestParticipant.length > 0) {
						// Guest has already joined, check if they have an active attempt
						const existingAttempt = await db
							.select({ id: gameAttempts.id })
							.from(gameAttempts)
							.where(and(eq(gameAttempts.quizSessionId, sessionId), eq(gameAttempts.participantId, existingGuestParticipant[0].id), eq(gameAttempts.status, "in_progress")))
							.limit(1)

						if (existingAttempt.length > 0) {
							// Redirect to existing attempt
							throw redirect(302, `/play/session/${sessionId}/${existingAttempt[0].id}`)
						} else {
							// Create new attempt for existing guest participant
							const newAttempt = await db
								.insert(gameAttempts)
								.values({
									quizSessionId: sessionId,
									participantId: existingGuestParticipant[0].id,
									attemptNumber: 1,
									status: "in_progress",
									startedAt: new Date()
								})
								.returning({ id: gameAttempts.id })

							throw redirect(302, `/play/session/${sessionId}/${newAttempt[0].id}`)
						}
					}
				}

				// Add guest user to participants
				const participant = await db
					.insert(sessionParticipants)
					.values({
						quizSessionId: sessionId,
						userId: null,
						guestId: guestId,
						name: trimmedName
					})
					.returning({ id: sessionParticipants.id })

				participantId = participant[0].id
			}

			// Create a new game attempt for the participant
			const gameAttempt = await db
				.insert(gameAttempts)
				.values({
					quizSessionId: sessionId,
					participantId: participantId,
					attemptNumber: 1,
					status: "in_progress",
					startedAt: new Date()
				})
				.returning({ id: gameAttempts.id })

			// Redirect to the game attempt page
			throw redirect(302, `/play/session/${sessionId}/${gameAttempt[0].id}`)
		} catch (err) {
			// Re-throw redirect errors (they're not actual errors)
			if (err && typeof err === "object" && "status" in err && "location" in err) {
				throw err
			}
			console.error("Error joining session:", err)
			return fail(500, { error: "Failed to join session" })
		}
	},

	reattempt: async ({ params, locals }) => {
		const sessionId = parseInt(params.sessionId)

		if (isNaN(sessionId)) {
			return fail(400, { error: "Invalid session ID" })
		}

		try {
			// Check if session exists and is active
			const sessionResult = await db.select({ id: quizSessions.id, status: quizSessions.status }).from(quizSessions).where(eq(quizSessions.id, sessionId)).limit(1)

			if (sessionResult.length === 0) {
				return fail(404, { error: "Session not found" })
			}

			const session = sessionResult[0]
			if (session.status !== "active") {
				return fail(400, { error: "Session is not active" })
			}

			const authSession = await locals.auth()
			if (!authSession?.user) {
				return fail(401, { error: "Authentication required" })
			}

			// Find the participant record for this user
			const participantResult = await db
				.select({ id: sessionParticipants.id })
				.from(sessionParticipants)
				.where(and(eq(sessionParticipants.quizSessionId, sessionId), eq(sessionParticipants.userId, authSession.user.id)))
				.limit(1)

			if (participantResult.length === 0) {
				return fail(400, { error: "You must join the session first" })
			}

			const participantId = participantResult[0].id

			// Get the current attempt number for this participant
			const lastAttemptResult = await db
				.select({ attemptNumber: gameAttempts.attemptNumber })
				.from(gameAttempts)
				.where(and(eq(gameAttempts.quizSessionId, sessionId), eq(gameAttempts.participantId, participantId)))
				.orderBy(gameAttempts.attemptNumber)

			const nextAttemptNumber = lastAttemptResult.length > 0 ? Math.max(...lastAttemptResult.map((a) => a.attemptNumber || 1)) + 1 : 1

			// Create a new game attempt
			const newAttempt = await db
				.insert(gameAttempts)
				.values({
					quizSessionId: sessionId,
					participantId: participantId,
					attemptNumber: nextAttemptNumber,
					status: "in_progress",
					startedAt: new Date()
				})
				.returning({ id: gameAttempts.id })

			// Redirect to the new attempt
			throw redirect(302, `/play/session/${sessionId}/${newAttempt[0].id}`)
		} catch (err) {
			// Re-throw redirect errors (they're not actual errors)
			if (err && typeof err === "object" && "status" in err && "location" in err) {
				throw err
			}
			console.error("Error creating reattempt:", err)
			return fail(500, { error: "Failed to create new attempt" })
		}
	}
}
