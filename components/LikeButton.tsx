'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession } from '@/lib/session'

interface LikeButtonProps {
  postId: string
  initialCount: number
  initialLiked: boolean
}

export default function LikeButton({ postId, initialCount, initialLiked }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const toggleLike = async () => {
    const session = getSession()
    if (!session || loading) return

    setLoading(true)
    try {
      if (liked) {
        // 좋아요 취소
        const likesSnap = await getDocs(
          query(
            collection(db, 'likes'),
            where('postId', '==', postId),
            where('participantId', '==', session.id)
          )
        )
        for (const d of likesSnap.docs) {
          await deleteDoc(doc(db, 'likes', d.id))
        }
        const newCount = Math.max(0, count - 1)
        await updateDoc(doc(db, 'posts', postId), { likesCount: newCount })
        setCount(newCount)
        setLiked(false)
      } else {
        // 좋아요
        await addDoc(collection(db, 'likes'), {
          postId,
          participantId: session.id,
          createdAt: new Date(),
        })
        const newCount = count + 1
        await updateDoc(doc(db, 'posts', postId), { likesCount: newCount })
        setCount(newCount)
        setLiked(true)
      }
    } catch (err) {
      console.error('좋아요 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition ${
        liked
          ? 'bg-red-50 text-red-500'
          : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-400'
      }`}
    >
      <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
      <span>{count}</span>
    </button>
  )
}
