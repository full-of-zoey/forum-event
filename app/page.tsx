'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession, setSession } from '@/lib/session'
import Image from 'next/image'
import { Users } from 'lucide-react'

export default function EntryPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [affiliation, setAffiliation] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    const session = getSession()
    if (session) {
      router.replace('/board')
    } else {
      setCheckingSession(false)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !affiliation.trim()) return

    setLoading(true)
    try {
      const docRef = await addDoc(collection(db, 'participants'), {
        name: name.trim(),
        affiliation: affiliation.trim(),
        createdAt: serverTimestamp(),
      })

      setSession({
        id: docRef.id,
        name: name.trim(),
        affiliation: affiliation.trim(),
      })
      router.push('/board')
    } catch (err) {
      console.error('입장 오류:', err)
      alert('입장 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* 배경 이미지 */}
      <Image
        src="/bg-entry.png"
        alt=""
        fill
        className="object-cover object-top"
        priority
      />

      {/* 입장 폼 영역 (중앙) */}
      <div className="relative z-10 w-full max-w-md px-4 py-6">
        {/* 반투명 글래스 카드 */}
        <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-lg border border-white/50 p-6 space-y-4">
          <div className="text-center mb-2">
            <Image
              src="/logo.png"
              alt="사이좋은 AI 포럼"
              width={56}
              height={56}
              className="mx-auto mb-3"
            />
            <p className="text-gray-600 text-sm font-medium">
              어서오세요. 사이좋은 네트워크입니다
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-500 mb-1">
                이름
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-4 py-3 rounded-xl bg-white/70 border border-gray-200/80 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-gray-900 placeholder:text-gray-300"
                required
              />
            </div>

            <div>
              <label htmlFor="affiliation" className="block text-xs font-medium text-gray-500 mb-1">
                소속 (학교/기관)
              </label>
              <input
                id="affiliation"
                type="text"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder="서울초등학교"
                className="w-full px-4 py-3 rounded-xl bg-white/70 border border-gray-200/80 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-gray-900 placeholder:text-gray-300"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim() || !affiliation.trim()}
              className="w-full py-3 rounded-xl bg-primary-400 hover:bg-primary-500 active:bg-primary-600 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  입장하기
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-2">
            입장 정보는 포럼 기간 중 소통을 위해 사용됩니다
          </p>
        </div>
      </div>
    </div>
  )
}
