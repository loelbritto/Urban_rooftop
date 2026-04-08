'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthGaurd({
	children,
	redirectTo = '/',
	fallback = (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
		</div>
	),
	onUser,
}) {
	const router = useRouter()
	const [checking, setChecking] = useState(true)

	useEffect(() => {
		let active = true

		async function checkAuth() {
			const { data: sessionData } = await supabase.auth.getSession()
			const sessionUser = sessionData?.session?.user ?? null

			if (sessionUser) {
				if (!active) return
				if (onUser) onUser(sessionUser)
				setChecking(false)
				return
			}

			const { data } = await supabase.auth.getUser()
			const user = data?.user ?? null

			if (!active) return

			if (!user) {
				router.replace(redirectTo)
				return
			}

			if (onUser) onUser(user)
			setChecking(false)
		}

		checkAuth()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (!active) return

			const authUser = session?.user ?? null
			if (!authUser) {
				router.replace(redirectTo)
				return
			}

			if (onUser) onUser(authUser)
			setChecking(false)
		})

		return () => {
			active = false
			subscription.unsubscribe()
		}
	}, [router, redirectTo, onUser])

	if (checking) return fallback

	return children
}
