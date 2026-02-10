'use client'

import { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession } from '@/lib/session'
import ParticipantBadge from './ParticipantBadge'

interface Comment {
  id: string
  content: string
  createdAt: string
  authorName: string
  authorAffiliation: string
}

interface CommentSectionProps {
  postId: string
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => {
        const d = doc.data()
        return {
          id: doc.id,
          content: d.content,
          createdAt: d.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          authorName: d.authorName || '알 수 없음',
          authorAffiliation: d.authorAffiliation || '',
        }
      })
      setComments(commentsData)
    })

    return () => unsubscribe()
  }, [postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const session = getSession()
    if (!session || !newComment.trim() || loading) return

    setLoading(true)
    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        participantId: session.id,
        authorName: session.name,
        authorAffiliation: session.affiliation,
        content: newComment.trim(),
        createdAt: serverTimestamp(),
      })
      setNewComment('')
    } catch (err) {
      console.error('댓글 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">
        댓글 {comments.length > 0 && <span className="text-primary-500">{comments.length}</span>}
      </h3>

      <div className="space-y-3 mb-4">
        {comments.length === 0 && (
          <p className="text-sm text-gray-300 text-center py-4">
            아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
          </p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <ParticipantBadge
                name={comment.authorName}
                affiliation={comment.authorAffiliation}
              />
              <span className="text-xs text-gray-300">{timeAgo(comment.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700 pl-9">{comment.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 남겨보세요..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm text-gray-900 placeholder:text-gray-300"
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="p-2.5 rounded-xl bg-primary-400 text-white hover:bg-primary-500 transition disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}
