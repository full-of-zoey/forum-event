'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Megaphone, Clock, Plus } from 'lucide-react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession, isAdmin } from '@/lib/session'
import Header from '@/components/Header'

interface Notice {
  id: string
  title: string
  content: string
  authorName: string
  createdAt: string
}

// URL을 클릭 가능한 링크로 변환
function linkify(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary-500 underline break-all">
        {part}
      </a>
    ) : (
      part
    )
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function NoticesPage() {
  const router = useRouter()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.replace('/')
      return
    }
    setAdmin(isAdmin())

    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data()
        return {
          id: doc.id,
          title: d.title,
          content: d.content,
          authorName: d.authorName || '관리자',
          createdAt: d.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        }
      })
      setNotices(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-gray-900">공지사항</h1>
          {admin && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-primary-400 text-white hover:bg-primary-500 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              공지 작성
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-300 mb-1">아직 공지사항이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="w-4 h-4 text-primary-500" />
                  <span className="text-xs font-medium text-primary-600">공지</span>
                  <span className="text-xs text-gray-300 ml-auto flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(notice.createdAt)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{notice.title}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {linkify(notice.content)}
                </p>
                <p className="text-xs text-gray-400 mt-3">{notice.authorName}</p>
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
