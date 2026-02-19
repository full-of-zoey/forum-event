'use client'

import { useState } from 'react'
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession } from '@/lib/session'
import { REACTION_EMOJIS, EMPTY_REACTIONS_COUNT, type ReactionKey, type ReactionsCount } from '@/lib/constants'

interface ReactionBarProps {
  postId: string
  initialReactions: ReactionsCount
  initialUserReactions: ReactionKey[]
  mode: 'compact' | 'full'
}

export default function ReactionBar({
  postId,
  initialReactions,
  initialUserReactions,
  mode,
}: ReactionBarProps) {
  const [reactions, setReactions] = useState<ReactionsCount>({ ...EMPTY_REACTIONS_COUNT, ...initialReactions })
  const [userReactions, setUserReactions] = useState<Set<ReactionKey>>(
    new Set(initialUserReactions)
  )
  const [loading, setLoading] = useState<ReactionKey | null>(null)

  const toggleReaction = async (key: ReactionKey) => {
    const session = getSession()
    if (!session || loading) return

    setLoading(key)
    try {
      const hasReacted = userReactions.has(key)

      if (hasReacted) {
        const snap = await getDocs(
          query(
            collection(db, 'reactions'),
            where('postId', '==', postId),
            where('participantId', '==', session.id),
            where('emoji', '==', key)
          )
        )
        for (const d of snap.docs) {
          await deleteDoc(doc(db, 'reactions', d.id))
        }
        const newCount = Math.max(0, reactions[key] - 1)
        await updateDoc(doc(db, 'posts', postId), {
          [`reactionsCount.${key}`]: newCount,
        })
        setReactions((prev) => ({ ...prev, [key]: newCount }))
        setUserReactions((prev) => {
          const s = new Set(prev)
          s.delete(key)
          return s
        })
      } else {
        await addDoc(collection(db, 'reactions'), {
          postId,
          participantId: session.id,
          emoji: key,
          createdAt: new Date(),
        })
        const newCount = reactions[key] + 1
        await updateDoc(doc(db, 'posts', postId), {
          [`reactionsCount.${key}`]: newCount,
        })
        setReactions((prev) => ({ ...prev, [key]: newCount }))
        setUserReactions((prev) => new Set(prev).add(key))
      }
    } catch (err) {
      console.error('리액션 오류:', err)
    } finally {
      setLoading(null)
    }
  }

  if (mode === 'compact') {
    const activeReactions = REACTION_EMOJIS.filter((r) => reactions[r.key] > 0)

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {activeReactions.length === 0 ? (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleReaction('thumbsUp')
            }}
            disabled={loading === 'thumbsUp'}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-gray-50 text-gray-400 hover:bg-gray-100 transition"
          >
            <span>👍</span>
            <span>0</span>
          </button>
        ) : (
          activeReactions.map((r) => (
            <button
              key={r.key}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleReaction(r.key)
              }}
              disabled={loading === r.key}
              className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-xs transition ${
                userReactions.has(r.key)
                  ? 'bg-primary-50 border border-primary-200'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <span>{r.emoji}</span>
              <span className="text-gray-600">{reactions[r.key]}</span>
            </button>
          ))
        )}
      </div>
    )
  }

  // full 모드
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {REACTION_EMOJIS.map((r) => (
        <button
          key={r.key}
          onClick={() => toggleReaction(r.key)}
          disabled={loading === r.key}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition ${
            userReactions.has(r.key)
              ? 'bg-primary-50 border border-primary-200 shadow-sm'
              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
          }`}
        >
          <span className="text-base">{r.emoji}</span>
          <span>{reactions[r.key]}</span>
        </button>
      ))}
    </div>
  )
}
