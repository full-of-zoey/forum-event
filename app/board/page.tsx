'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import {
  collection, query, orderBy, onSnapshot, getDocs, where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession } from '@/lib/session'
import { type Category } from '@/lib/constants'
import Header from '@/components/Header'
import PostCard from '@/components/PostCard'
import CategoryFilter from '@/components/CategoryFilter'

interface Post {
  id: string
  title: string
  content: string
  category: string
  likesCount: number
  createdAt: string
  authorName: string
  authorAffiliation: string
  commentsCount: number
  liked: boolean
  speakerName?: string
}

export default function BoardPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체')
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

        let liked = false
        if (session) {
          const likesSnap = await getDocs(
            query(
              collection(db, 'likes'),
              where('postId', '==', docSnap.id),
              where('participantId', '==', session.id)
            )
          )
          liked = !likesSnap.empty
        }

        postsData.push({
          id: docSnap.id,
          title: d.title,
          content: d.content,
          category: d.category,
          likesCount: d.likesCount || 0,
          createdAt: d.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          authorName: d.authorName || '알 수 없음',
          authorAffiliation: d.authorAffiliation || '',
          commentsCount: commentsSnap.size,
          liked,
          speakerName: d.speakerName || undefined,
        })
      }

      setPosts(postsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const filteredPosts = selectedCategory === '전체'
    ? posts
    : posts.filter((p) => p.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="mb-4">
          <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
        </div>

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
                likesCount={post.likesCount}
                commentsCount={post.commentsCount}
                createdAt={post.createdAt}
                authorName={post.authorName}
                authorAffiliation={post.authorAffiliation}
                liked={post.liked}
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
