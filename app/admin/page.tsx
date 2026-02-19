'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSession, setAdminFlag } from '@/lib/session'

function AdminEntry() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'checking' | 'unauthorized'>('checking')

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.replace('/')
      return
    }

    const key = searchParams.get('key')
    if (key === process.env.NEXT_PUBLIC_ADMIN_KEY) {
      setAdminFlag()
      router.replace('/admin/dashboard')
    } else {
      setStatus('unauthorized')
    }
  }, [router, searchParams])

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <p className="text-gray-400">접근 권한이 없습니다.</p>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      }
    >
      <AdminEntry />
    </Suspense>
  )
}
