export interface Participant {
  id: string
  name: string
  affiliation: string
  isAdmin?: boolean
}

const SESSION_KEY = 'ai-forum-participant'

export function getSession(): Participant | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(SESSION_KEY)
  if (!data) return null
  try {
    return JSON.parse(data) as Participant
  } catch {
    return null
  }
}

export function setSession(participant: Participant): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(participant))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function setAdminFlag(): void {
  const session = getSession()
  if (session) {
    setSession({ ...session, isAdmin: true })
  }
}

export function isAdmin(): boolean {
  const session = getSession()
  return session?.isAdmin === true
}
