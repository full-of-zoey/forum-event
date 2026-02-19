export const CATEGORIES = [
  '전체',
  '연사에게 질문',
  'AI 교육 사례 공유/고민',
  '함께 해보고 싶은 일',
] as const

export type Category = typeof CATEGORIES[number]

export const POST_CATEGORIES = CATEGORIES.filter((c) => c !== '전체') as unknown as readonly string[]

export interface Speaker {
  name: string
  role: string
}

export interface Session {
  id: string
  number: number
  title: string
  time: string
  speakers: Speaker[]
}

export const SESSIONS: Session[] = [
  {
    id: 'session-1',
    number: 1,
    title: '지나온 10년, 우리가 함께 만들어온 디지털 시민성',
    time: '13:20–14:40',
    speakers: [
      { name: '나희선', role: '샌드박스 공동창업자/CCO' },
      { name: '김봉섭', role: '한국지능정보사회진흥원 연구위원' },
      { name: '이지섭', role: '어썸스쿨 이사회 의장' },
      { name: '최지원', role: '카카오임팩트 PM' },
    ],
  },
  {
    id: 'session-2',
    number: 2,
    title: '다가올 10년, 함께 상상해보는 AI와 함께할 내일',
    time: '15:10–16:10',
    speakers: [
      { name: '이재욱', role: '서울대 AI연구원장' },
      { name: '오유나', role: '서울장평초 교사' },
      { name: '배명훈', role: 'SF작가' },
      { name: '유호현', role: 'tobl.ai 대표' },
    ],
  },
  {
    id: 'session-3',
    number: 3,
    title: '나아갈 10년, AI 시대를 잘 살아가기 위한 미래 인재의 조건',
    time: '16:10–16:50',
    speakers: [
      { name: '장대익', role: '가천대 스타트업칼리지 학장' },
      { name: '류석영', role: 'KAIST 전산학부 학부장' },
    ],
  },
  {
    id: 'session-closing',
    number: 4,
    title: '디지털 시민성을 넘어, AI 시민성을 함께',
    time: '16:50–17:00',
    speakers: [
      { name: '육심나', role: '카카오임팩트 사무국장/카카오 부사장' },
    ],
  },
  {
    id: 'session-mc',
    number: 0,
    title: '사회자',
    time: '',
    speakers: [
      { name: '최태성', role: '별별한국사 역사커뮤니케이터' },
    ],
  },
]

export interface CategoryStyle {
  badge: { backgroundColor: string; color: string }
  border: string
}

export const categoryStyles: Record<string, CategoryStyle> = {
  '연사에게 질문': {
    badge: { backgroundColor: '#FFFBEB', color: '#D97706' },
    border: '#FCD34D',
  },
  'AI 교육 사례 공유/고민': {
    badge: { backgroundColor: '#FDF2F8', color: '#DB2777' },
    border: '#F9A8D4',
  },
  '함께 해보고 싶은 일': {
    badge: { backgroundColor: '#EFF6FF', color: '#2563EB' },
    border: '#93C5FD',
  },
}

const defaultStyle: CategoryStyle = {
  badge: { backgroundColor: '#F9FAFB', color: '#6B7280' },
  border: '#E5E7EB',
}

export function getCategoryStyle(category: string): CategoryStyle {
  return categoryStyles[category] || defaultStyle
}

// 이모지 리액션
export const REACTION_EMOJIS = [
  { key: 'thumbsUp', emoji: '👍', label: '좋아요' },
  { key: 'heart', emoji: '❤️', label: '하트' },
  { key: 'fire', emoji: '🔥', label: '불꽃' },
  { key: 'clap', emoji: '👏', label: '박수' },
  { key: 'wow', emoji: '😮', label: '놀람' },
] as const

export type ReactionKey = typeof REACTION_EMOJIS[number]['key']

export type ReactionsCount = Record<ReactionKey, number>

export const EMPTY_REACTIONS_COUNT: ReactionsCount = {
  thumbsUp: 0,
  heart: 0,
  fire: 0,
  clap: 0,
  wow: 0,
}
