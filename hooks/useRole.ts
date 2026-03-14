'use client'

import { useUser } from '@clerk/nextjs'
import type { UserRole } from '@/types'

/**
 * Returns the current user's role from their Clerk public metadata.
 * Returns `null` if the user is not signed in or has no role assigned.
 *
 * @example
 * const role = useRole()
 * if (role === 'ADMIN') { ... }
 */
export function useRole(): UserRole | null {
  const { user } = useUser()
  return (user?.publicMetadata?.role as UserRole) ?? null
}

/**
 * Returns true if the current user has the given role.
 */
export function useHasRole(role: UserRole): boolean {
  return useRole() === role
}

/**
 * Returns true if the current user is an admin.
 */
export function useIsAdmin(): boolean {
  return useRole() === 'ADMIN'
}

/**
 * Returns true if the current user is a creator.
 */
export function useIsCreator(): boolean {
  return useRole() === 'CREATOR'
}

/**
 * Returns true if the current user is a brand.
 */
export function useIsBrand(): boolean {
  return useRole() === 'BRAND'
}
