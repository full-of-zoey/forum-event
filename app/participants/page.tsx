'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Building2, ArrowUpAZ, ArrowDownAZ } from 'lucide-react'
import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession } from '@/lib/session'
import Header from '@/components/Header'

interface Participant {
  id: string
  name: string
  affiliation: string
}

export default function ParticipantsPage() {
  const router = useRouter()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [asc, setAsc] = useState(true)

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.replace('/')
      return
    }
    fetchParticipants()
  }, [router])

  const fetchParticipants = async () => {
    const q = query(collection(db, 'participants'))
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      affiliation: doc.data().affiliation,
    }))
    data.sort((a, b) => a.affiliation.localeCompare(b.affiliation) || a.name.localeCompare(b.name))
    setParticipants(data)
    setLoading(false)
  }

  const grouped = participants.reduce<Record<string, Participant[]>>((acc, p) => {
    if (!acc[p.affiliation]) acc[p.affiliation] = []
    acc[p.affiliation].push(p)
    return acc
  }, {})

  const sortedAffiliations = Object.keys(grouped).sort((a, b) =>
    asc ? a.localeCompare(b) : b.localeCompare(a)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500">
            총 <span className="font-semibold text-gray-900">{loading ? '...' : participants.length}</span>명
          </p>
          <button
            onClick={() => setAsc(!asc)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            {asc ? <ArrowUpAZ className="w-4 h-4" /> : <ArrowDownAZ className="w-4 h-4" />}
            {asc ? 'ㄱ→ㅎ' : 'ㅎ→ㄱ'}
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAffiliations.map((affiliation) => (
              <div key={affiliation} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-700 text-sm">{affiliation}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {grouped[affiliation].length}명
                  </span>
                </div>

                <div className="divide-y divide-gray-50">
                  {grouped[affiliation].map((p) => (
                    <div key={p.id} className="px-4 py-2.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-semibold text-xs flex items-center justify-center flex-shrink-0">
                        {p.name.slice(0, 1)}
                      </div>
                      <span className="text-sm text-gray-900">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-300 py-4">
        <a href="https://www.kakaoimpact.org" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition">&copy; 2026 kakaoimpact</a>
      </footer>
    </div>
  )
}
