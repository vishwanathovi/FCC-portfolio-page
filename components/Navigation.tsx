'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const navLinks = [
  { href: '/', label: 'Today' },
  { href: '/check-in', label: 'Morning' },
  { href: '/reframe', label: 'Reframe' },
  { href: '/evening', label: 'Evening' },
  { href: '/history', label: 'History' },
]

export function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session) return null

  return (
    <nav className="border-b border-[#E8E2D9] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-[#1C1C1E] tracking-tight text-lg">
          enough
        </Link>
        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname === link.href
                  ? 'bg-[#F5EDE0] text-[#7C6350] font-medium'
                  : 'text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#F5F5F5]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="ml-2 px-3 py-1.5 rounded-md text-sm text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#F5F5F5] transition-colors"
          >
            Out
          </button>
        </div>
      </div>
    </nav>
  )
}
