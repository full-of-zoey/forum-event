export const CATEGORIES = [
  '전체',
  '연사에게 질문',
  'AI 교육 사례 자랑',
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
]

export const categoryColors: Record<string, string> = {
  '연사에게 질문': 'bg-amber-50 text-amber-600',
  'AI 교육 사례 자랑': 'bg-blue-50 text-blue-600',
  '함께 해보고 싶은 일': 'bg-purple-50 text-purple-600',
}
