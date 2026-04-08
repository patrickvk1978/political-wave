// Auth is not required for Phase 1 (static data, no DB).
// This stub keeps the interface stable for when admin auth is added.
import { createContext, useContext, type ReactNode } from 'react'

interface AuthContextValue {
  isAdmin: boolean
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue>({ isAdmin: false, signOut: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={{ isAdmin: false, signOut: () => {} }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
