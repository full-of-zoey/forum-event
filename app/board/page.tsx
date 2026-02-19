'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Mic2, Clock, Flame } from 'lucide-react'
import {
  collection, query, orderBy, onSnapshot, getDocs, where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession } from '@/lib/session'
import {
  type Category, SESSIONS, EMPTY_REACTIONS_COUNT,
  type ReactionsCount, type ReactionKey,
} from '@/lib/constants'
import Header from '@/components/Header'
import PostCard from '@/components/PostCard'
import CategoryFilter from '@/components/CategoryFilter'

interface Post {
  id: string
  title: string
  content: string
  category: string
  reactionsCount: ReactionsCount
  userReactions: ReactionKey[]
  createdAt: string
  authorName: string
  authorAffiliation: string
  commentsCount: number
  speakerName?: string
}

export default function BoardPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체')
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('')
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.replace('/')
      return
    }

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const session = getSession()
      const postsData: Post[] = []

      for (const docSnap of snapshot.docs) {
        const d = docSnap.data()

        const commentsSnap = await getDocs(collection(db, 'posts', docSnap.id, 'comments'))

        let userReactions: ReactionKey[] = []
        if (session) {
          const reactionsSnap = await getDocs(
            query(
              collection(db, 'reactions'),
              where('postId', '==', docSnap.id),
              where('participantId', '==', session.id)
            )
          )
          userReactions = reactionsSnap.docs.map((d) => d.data().emoji as ReactionKey)
        }

        postsData.push({
          id: docSnap.id,
          title: d.title,
          content: d.content,
          category: d.category,
          reactionsCount: d.reactionsCount || EMPTY_REACTIONS_COUNT,
          userReactions,
          createdAt: d.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          authorName: d.authorName || '알 수 없음',
          authorAffiliation: d.authorAffiliation || '',
          commentsCount: commentsSnap.size,
          speakerName: d.speakerName || undefined,
        })
      }

      setPosts(postsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const isQnACategory = selectedCategory === '연사에게 질문'

  const allSpeakers = SESSIONS.flatMap((s) => s.speakers.map((sp) => sp.name))
  const speakersWithQuestions = allSpeakers.filter((name) =>
    posts.some((p) => p.category === '연사에게 질문' && p.speakerName === name)
  )

  useEffect(() => {
    if (!isQnACategory) setSelectedSpeaker('')
  }, [isQnACategory])

  const getPopularityScore = (post: Post) => {
    const totalReactions = Object.values(post.reactionsCount).reduce((a, b) => a + b, 0)
    return totalReactions + post.commentsCount * 2
  }

  const filteredPosts = (() => {
    let result = selectedCategory === '전체'
      ? posts
      : posts.filter((p) => p.category === selectedCategory)

    if (isQnACategory && selectedSpeaker) {
      result = result.filter((p) => p.speakerName === selectedSpeaker)
    }

    if (sortBy === 'popular') {
      result = [...result].sort((a, b) => getPopularityScore(b) - getPopularityScore(a))
    }

    return result
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="mb-3">
          <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
        </div>

        {/* 정렬 토글 */}
        <div className="flex gap-1.5 mb-3">
          <button
            onClick={() => setSortBy('recent')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              sortBy === 'recent'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-400 border border-gray-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            최신순
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              sortBy === 'popular'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-400 border border-gray-200'
            }`}
          >
            <Flame className="w-3 h-3" />
            인기순
          </button>
        </div>

        {/* 연사별 필터 */}
        {isQnACategory && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedSpeaker('')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  !selectedSpeaker
                    ? 'bg-amber-100 text-amber-700 shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-amber-300'
                }`}
              >
                <Mic2 className="w-3 h-3" />
                전체 연사
              </button>
              {allSpeakers.map((name) => {
                const hasQuestions = speakersWithQuestions.includes(name)
                const questionCount = posts.filter((p) => p.category === '연사에게 질문' && p.speakerName === name).length
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedSpeaker(selectedSpeaker === name ? '' : name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                      selectedSpeaker === name
                        ? 'bg-amber-100 text-amber-700 shadow-sm'
                        : hasQuestions
                        ? 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
                        : 'bg-white text-gray-300 border border-gray-100'
                    }`}
                  >
                    {name}
                    {questionCount > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        selectedSpeaker === name ? 'bg-amber-200 text-amber-800' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {questionCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300 mb-2">아직 게시글이 없습니다</p>
            <p className="text-sm text-gray-300">첫 번째 글을 작성해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                content={post.content}
                category={post.category}
                reactionsCount={post.reactionsCount}
                userReactions={post.userReactions}
                commentsCount={post.commentsCount}
                createdAt={post.createdAt}
                authorName={post.authorName}
                authorAffiliation={post.authorAffiliation}
                speakerName={post.speakerName}
              />
            ))}
          </div>
        )}
      </main>

      <Link
        href="/post/new"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary-400 hover:bg-primary-500 active:bg-primary-600 text-white shadow-lg shadow-primary-200 flex items-center justify-center transition"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  )
}
