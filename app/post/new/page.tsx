'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mic2, ChevronDown, ChevronUp } from 'lucide-react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession } from '@/lib/session'
import { POST_CATEGORIES, SESSIONS, EMPTY_REACTIONS_COUNT } from '@/lib/constants'
import Header from '@/components/Header'

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<string>(POST_CATEGORIES[0])
  const [selectedSession, setSelectedSession] = useState<string>('')
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('')
  const [expandedSession, setExpandedSession] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const isQnA = category === '연사에게 질문'

  useEffect(() => {
    const session = getSession()
    if (!session) router.replace('/')
  }, [router])

  // 카테고리 변경 시 연사 선택 초기화
  useEffect(() => {
    if (!isQnA) {
      setSelectedSession('')
      setSelectedSpeaker('')
      setExpandedSession('')
    }
  }, [isQnA])

  const handleSelectSpeaker = (sessionId: string, speakerName: string) => {
    setSelectedSession(sessionId)
    setSelectedSpeaker(speakerName)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const session = getSession()
    if (!session || !content.trim() || loading) return
    if (isQnA && !selectedSpeaker) return

    setLoading(true)
    try {
      const postData: Record<string, unknown> = {
        participantId: session.id,
        authorName: session.name,
        authorAffiliation: session.affiliation,
        title: isQnA ? `${selectedSpeaker}님에게 질문` : title.trim(),
        content: content.trim(),
        category,
        reactionsCount: EMPTY_REACTIONS_COUNT,
        createdAt: serverTimestamp(),
      }

      if (isQnA) {
        postData.sessionId = selectedSession
        postData.speakerName = selectedSpeaker
      }

      await addDoc(collection(db, 'posts'), postData)
      router.push('/board')
    } catch (err) {
      console.error('글 작성 오류:', err)
      alert('글 작성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const selectedSessionData = SESSIONS.find((s) => s.id === selectedSession)

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

        <h1 className="text-xl font-bold text-gray-900 mb-4">새 글 작성</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              어떤 이야기를 나눌까요?
            </label>
            <div className="flex gap-2 flex-wrap">
              {POST_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    category === cat
                      ? 'bg-primary-400 text-white'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 연사 선택 (Q&A 카테고리일 때만) */}
          {isQnA && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                질문할 연사를 선택해주세요
              </label>
              <div className="space-y-2">
                {SESSIONS.filter((s) => s.number > 0).map((sess) => {
                  const sessionLabel = sess.id === 'session-closing'
                    ? `Closing · ${sess.time}`
                    : `Session ${sess.number} · ${sess.time}`
                  return (
                    <div
                      key={sess.id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                      {/* 세션 헤더 */}
                      <button
                        type="button"
                        onClick={() => setExpandedSession(expandedSession === sess.id ? '' : sess.id)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left"
                      >
                        <div>
                          <span className="text-xs font-medium text-primary-500">
                            {sessionLabel}
                          </span>
                          <p className="text-sm text-gray-700 font-medium mt-0.5 leading-snug">
                            {sess.title}
                          </p>
                        </div>
                        {expandedSession === sess.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                        )}
                      </button>

                      {/* 연사 목록 */}
                      {expandedSession === sess.id && (
                        <div className="border-t border-gray-100 px-2 py-2">
                          {sess.speakers.map((speaker) => {
                            const isSelected = selectedSession === sess.id && selectedSpeaker === speaker.name
                            return (
                              <button
                                key={speaker.name}
                                type="button"
                                onClick={() => handleSelectSpeaker(sess.id, speaker.name)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
                                  isSelected
                                    ? 'bg-primary-50 border border-primary-200'
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? 'bg-primary-400 text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                  <Mic2 className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className={`text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                                    {speaker.name}
                                  </p>
                                  <p className="text-xs text-gray-400">{speaker.role}</p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* 사회자 */}
                {SESSIONS.filter((s) => s.number === 0).map((sess) => (
                  <div
                    key={sess.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="px-2 py-2">
                      {sess.speakers.map((speaker) => {
                        const isSelected = selectedSession === sess.id && selectedSpeaker === speaker.name
                        return (
                          <button
                            key={speaker.name}
                            type="button"
                            onClick={() => handleSelectSpeaker(sess.id, speaker.name)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
                              isSelected
                                ? 'bg-primary-50 border border-primary-200'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-primary-400 text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                              <Mic2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                                {speaker.name} <span className="text-xs text-gray-400 font-normal">사회자</span>
                              </p>
                              <p className="text-xs text-gray-400">{speaker.role}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* 선택된 연사 표시 */}
              {selectedSpeaker && (
                <div className="mt-2 px-3 py-2 bg-primary-50 rounded-lg text-sm text-primary-700">
                  <span className="font-medium">{selectedSpeaker}</span>님
                  ({selectedSessionData?.title && `Session ${selectedSessionData.number}`})에게 질문합니다
                </div>
              )}
            </div>
          )}

          {/* 제목 (Q&A가 아닐 때만) */}
          {!isQnA && (
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
                제목
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-gray-900 placeholder:text-gray-300"
                required={!isQnA}
              />
            </div>
          )}

          {/* 본문 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1.5">
              {isQnA ? '질문 내용' : '내용'}
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isQnA
                  ? '연사에게 궁금한 점을 자유롭게 적어주세요.'
                  : category === 'AI 교육 사례 공유/고민'
                  ? '학교를 포함한 현장에서 실천하고 계시는 AI 활용 교육 사례를 공유해주세요! 자랑도 좋고 고민 나눔도 좋습니다 :)'
                  : '다른 선생님들과 함께 해보고 싶은 일을 이야기해주세요.'
              }
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-gray-900 placeholder:text-gray-300 resize-none"
              required
            />
          </div>

          {/* 게시 버튼 */}
          <button
            type="submit"
            disabled={loading || !content.trim() || (isQnA ? !selectedSpeaker : !title.trim())}
            className="w-full py-3 rounded-xl bg-primary-400 hover:bg-primary-500 active:bg-primary-600 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              </div>
            ) : (
              '게시하기'
            )}
          </button>
        </form>
      </main>

      <footer className="text-center text-xs text-gray-300 py-4">
        <a href="https://www.kakaoimpact.org" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition">&copy; 2026 kakaoimpact</a>
      </footer>
    </div>
  )
}
