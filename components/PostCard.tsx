'use client'

import Link from 'next/link'
import { MessageCircle, Clock, Mic2 } from 'lucide-react'
import { getCategoryStyle, type ReactionsCount, type ReactionKey } from '@/lib/constants'
import ParticipantBadge from './ParticipantBadge'
import ReactionBar from './ReactionBar'

interface PostCardProps {
  id: string
  title: string
  content: string
  category: string
  reactionsCount: ReactionsCount
  userReactions: ReactionKey[]
  commentsCount: number
  createdAt: string
  authorName: string
  authorAffiliation: string
  speakerName?: string
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

export default function PostCard({
  id,
  title,
  content,
  category,
  reactionsCount,
  userReactions,
  commentsCount,
  createdAt,
  authorName,
  authorAffiliation,
  speakerName,
}: PostCardProps) {
  const isQnA = category === '연사에게 질문'
  const style = getCategoryStyle(category)

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      style={{ borderLeftWidth: '4px', borderLeftColor: style.border }}
    >
      <Link href={`/post/${id}`} className="block p-4 pb-3">
        {/* 카테고리 + 시간 */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={style.badge}
          >
            {category}
          </span>
          <span className="text-xs text-gray-300 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(createdAt)}
          </span>
        </div>

        {/* 연사 태그 (Q&A일 때) */}
        {isQnA && speakerName && (
          <div className="flex items-center gap-1.5 mb-2 px-2.5 py-1.5 bg-amber-50 rounded-lg w-fit">
            <Mic2 className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-medium text-amber-700">{speakerName}님에게</span>
          </div>
        )}

        {/* 제목 + 본문 미리보기 */}
        {!isQnA && <h3 className="font-semibold text-gray-900 mb-1 text-[15px]">{title}</h3>}
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{content}</p>

        {/* 작성자 */}
        <ParticipantBadge name={authorName} affiliation={authorAffiliation} />
      </Link>

      {/* 하단 액션 */}
      <div className="px-4 py-2.5 border-t border-gray-50 flex items-center gap-3">
        <ReactionBar
          postId={id}
          initialReactions={reactionsCount}
          initialUserReactions={userReactions}
          mode="compact"
        />
        <Link
          href={`/post/${id}`}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-gray-50 text-gray-400 hover:bg-gray-100 transition"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{commentsCount}</span>
        </Link>
      </div>
    </div>
  )
}
