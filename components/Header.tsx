'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Bell, Sparkles, Shield } from 'lucide-react'
import { isAdmin as checkIsAdmin } from '@/lib/session'

export default function Header() {
  const pathname = usePathname()
  const [admin, setAdmin] = useState(false)

  useEffect(() => {
    setAdmin(checkIsAdmin())
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/board" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">사이좋은 AI 포럼</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/board"
            className={`p-2 rounded-lg transition ${
              pathname === '/board'
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </Link>
          <Link
            href="/notices"
            className={`p-2 rounded-lg transition ${
              pathname === '/notices'
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Bell className="w-5 h-5" />
          </Link>
          {admin && (
            <Link
              href="/admin/dashboard"
              className={`p-2 rounded-lg transition ${
                pathname?.startsWith('/admin')
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Shield className="w-5 h-5" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
