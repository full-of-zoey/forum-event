'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession, isAdmin } from '@/lib/session'
import { deletePost } from '@/lib/deletePost'
import { getCategoryStyle } from '@/lib/constants'
import Header from '@/components/Header'
import { Trash2, Megaphone, Shield, Send } from 'lucide-react'

interface PostItem {
  id: string
  title: string
  content: string
  category: string
  authorName: string
  authorAffiliation: string
  createdAt: string
}

interface NoticeItem {
  id: string
  title: string
  content: string
  createdAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [posts, setPosts] = useState<PostItem[]>([])
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [noticeTitle, setNoticeTitle] = useState('')
  const [noticeContent, setNoticeContent] = useState('')
  const [sending, setSending] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'notice' | 'posts'>('notice')

  useEffect(() => {
    if (!isAdmin()) {
      router.replace('/board')
      return
    }

    const postsQ = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const unsubPosts = onSnapshot(postsQ, (snapshot) => {
      setPosts(
        snapshot.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            title: data.title || '',
            content: data.content || '',
            category: data.category || '',
            authorName: data.authorName || '',
            authorAffiliation: data.authorAffiliation || '',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          }
        })
      )
    })

    const noticesQ = query(collection(db, 'notices'), orderBy('createdAt', 'desc'))
    const unsubNotices = onSnapshot(noticesQ, (snapshot) => {
      setNotices(
        snapshot.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            title: data.title || '',
            content: data.content || '',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          }
        })
      )
    })

    return () => {
      unsubPosts()
      unsubNotices()
    }
  }, [router])

  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault()
    const session = getSession()
    if (!session || !noticeTitle.trim() || !noticeContent.trim() || sending) return

    setSending(true)
    try {
      await addDoc(collection(db, 'notices'), {
        title: noticeTitle.trim(),
        content: noticeContent.trim(),
        authorName: session.name,
        createdAt: serverTimestamp(),
      })
      setNoticeTitle('')
      setNoticeContent('')
    } catch (err) {
      console.error('공지 작성 오류:', err)
      alert('공지 작성 중 오류가 발생했습니다.')
    } finally {
      setSending(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('이 게시글을 삭제하시겠습니까?')) return
    setDeletingId(postId)
    try {
      await deletePost(postId)
    } catch (err) {
      console.error('삭제 오류:', err)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteNotice = async (noticeId: string) => {
    if (!window.confirm('이 공지를 삭제하시겠습니까?')) return
    try {
      await deleteDoc(doc(db, 'notices', noticeId))
    } catch (err) {
      console.error('공지 삭제 오류:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary-500" />
          <h1 className="text-lg font-bold text-gray-900">관리자 대시보드</h1>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('notice')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === 'notice'
                ? 'bg-primary-400 text-white'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            공지 작성
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === 'posts'
                ? 'bg-primary-400 text-white'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            게시글 관리 ({posts.length})
          </button>
        </div>

        {activeTab === 'notice' && (
          <div className="space-y-4">
            {/* 공지 작성 폼 */}
            <form
              onSubmit={handleSendNotice}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Megaphone className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-semibold text-gray-900">새 공지 작성</span>
              </div>
              <input
                type="text"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="공지 제목"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-gray-900 placeholder:text-gray-300"
                required
              />
              <textarea
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                placeholder="공지 내용을 입력하세요..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-gray-900 placeholder:text-gray-300 resize-none"
                required
              />
              <button
                type="submit"
                disabled={sending || !noticeTitle.trim() || !noticeContent.trim()}
                className="w-full py-3 rounded-xl bg-primary-400 hover:bg-primary-500 text-white font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    공지 발행
                  </>
                )}
              </button>
            </form>

            {/* 기존 공지 목록 */}
            {notices.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400 px-1">발행된 공지 ({notices.length})</p>
                {notices.map((n) => (
                  <div key={n.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{n.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteNotice(n.id)}
                      className="text-red-300 hover:text-red-500 transition flex-shrink-0 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-2">
            {posts.map((post) => {
              const style = getCategoryStyle(post.category)
              return (
                <div
                  key={post.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex items-start justify-between gap-3"
                  style={{ borderLeftWidth: '3px', borderLeftColor: style.border }}
                >
                  <div className="min-w-0">
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full inline-block mb-1"
                      style={style.badge}
                    >
                      {post.category}
                    </span>
                    <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {post.authorName} · {post.authorAffiliation}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deletingId === post.id}
                    className="text-red-300 hover:text-red-500 transition flex-shrink-0 p-1 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-300 py-4">
        <a href="https://www.kakaoimpact.org" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition">&copy; 2026 kakaoimpact</a>
      </footer>
    </div>
  )
}
