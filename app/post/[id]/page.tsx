'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Clock, Mic2 } from 'lucide-react'
import { doc, getDoc, getDocs, query, collection, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession } from '@/lib/session'
import { categoryColors, SESSIONS } from '@/lib/constants'
import Header from '@/components/Header'
import ParticipantBadge from '@/components/ParticipantBadge'
import LikeButton from '@/components/LikeButton'
import CommentSection from '@/components/CommentSection'

interface PostDetail {
  id: string
  title: string
  content: string
  category: string
  likesCount: number
  createdAt: string
  authorName: string
  authorAffiliation: string
  liked: boolean
  speakerName?: string
  sessionId?: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.replace('/')
      return
    }
    fetchPost()
  }, [postId, router])

  const fetchPost = async () => {
    const session = getSession()
    const docSnap = await getDoc(doc(db, 'posts', postId))

    if (!docSnap.exists()) {
      router.replace('/board')
      return
    }

    const d = docSnap.data()

    let liked = false
    if (session) {
      const likesSnap = await getDocs(
        query(
          collection(db, 'likes'),
          where('postId', '==', postId),
          where('participantId', '==', session.id)
        )
      )
      liked = !likesSnap.empty
    }

    setPost({
      id: docSnap.id,
      title: d.title,
      content: d.content,
      category: d.category,
      likesCount: d.likesCount || 0,
      createdAt: d.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      authorName: d.authorName || '알 수 없음',
      authorAffiliation: d.authorAffiliation || '',
      liked,
      speakerName: d.speakerName || undefined,
      sessionId: d.sessionId || undefined,
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      </div>
    )
  }

  if (!post) return null

  const isQnA = post.category === '연사에게 질문'
  const sessionData = SESSIONS.find((s) => s.id === post.sessionId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </button>

        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[post.category] || 'bg-gray-50 text-gray-500'}`}>
            {post.category}
          </span>

          {/* 연사 정보 (Q&A일 때) */}
          {isQnA && post.speakerName && (
            <div className="mt-3 p-3 bg-amber-50 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Mic2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">{post.speakerName}님에게 질문</p>
                {sessionData && (
                  <p className="text-xs text-amber-600 mt-0.5">
                    Session {sessionData.number} · {sessionData.title}
                  </p>
                )}
              </div>
            </div>
          )}

          {!isQnA && <h1 className="text-lg font-bold text-gray-900 mt-3 mb-2">{post.title}</h1>}

          <div className="flex items-center justify-between mb-4 mt-3">
            <ParticipantBadge name={post.authorName} affiliation={post.authorAffiliation} size="md" />
            <span className="text-xs text-gray-300 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(post.createdAt)}
            </span>
          </div>

          <div className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap mb-4">
            {post.content}
          </div>

          <div className="pt-3 border-t border-gray-50">
            <LikeButton postId={post.id} initialCount={post.likesCount} initialLiked={post.liked} />
          </div>
        </article>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <CommentSection postId={post.id} />
        </div>
      </main>
    </div>
  )
}
