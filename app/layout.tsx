import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '사이좋은 AI포럼 2026',
  description: '카카오임팩트 사이좋은 AI포럼 2026 참가자 네트워킹',
  openGraph: {
    title: '사이좋은 AI포럼 2026',
    description: '카카오와 함께 만드는 아이들의 AI 미래',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '사이좋은 AI포럼 2026',
    description: '카카오와 함께 만드는 아이들의 AI 미래',
    images: ['/og-image.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
