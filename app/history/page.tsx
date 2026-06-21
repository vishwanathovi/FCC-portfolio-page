import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navigation } from '@/components/Navigation'
import { HistoryList } from '@/components/HistoryList'

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/signin')

  const entries = await prisma.dailyEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    take: 30,
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide mb-1">Your journal</p>
          <h1 className="text-2xl font-semibold text-[#1C1C1E]">History</h1>
          <p className="text-[#6B7280] text-sm mt-1">Your past entries. {entries.length} day{entries.length !== 1 ? 's' : ''} recorded.</p>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📓</p>
            <p className="text-[#6B7280] text-sm">No entries yet.</p>
            <Link href="/check-in" className="inline-block mt-4 text-[#7C6350] text-sm font-medium hover:underline">
              Start your first morning check-in →
            </Link>
          </div>
        ) : (
          <HistoryList entries={entries} />
        )}
      </main>
    </div>
  )
}
