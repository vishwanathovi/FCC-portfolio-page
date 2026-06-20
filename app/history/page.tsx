import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navigation } from '@/components/Navigation'
import { formatDate, parseJsonField } from '@/lib/utils'

type MorningAI = { enoughToday: string; summary: string }
type EveningAI = { shutdownStatement: string }

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

        {entries.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📓</p>
            <p className="text-[#6B7280] text-sm">No entries yet.</p>
            <Link href="/check-in" className="inline-block mt-4 text-[#7C6350] text-sm font-medium hover:underline">
              Start your first morning check-in →
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {entries.map((entry) => {
            const morningAI = parseJsonField<MorningAI | null>(entry.aiMorningResponse, null)
            const eveningAI = parseJsonField<EveningAI | null>(entry.aiEveningResponse, null)
            const hasMorning = !!entry.mindDump
            const hasEvening = !!entry.eveningDone

            return (
              <div key={entry.id} className="bg-white rounded-2xl border border-[#E8E2D9] p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-[#1C1C1E]">{formatDate(entry.date)}</p>
                    <div className="flex gap-2 mt-1">
                      {entry.mood && (
                        <span className="px-2 py-0.5 bg-[#F5EDE0] text-[#7C6350] text-xs rounded-full">{entry.mood}</span>
                      )}
                      {entry.energyLevel && (
                        <span className="px-2 py-0.5 bg-[#EEF2F7] text-[#4B5A72] text-xs rounded-full">Energy {entry.energyLevel}/10</span>
                      )}
                      {hasEvening && (
                        <span className="px-2 py-0.5 bg-[#EAF5EF] text-[#2D6A4F] text-xs rounded-full">Day closed ✓</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[#D1C9BF] text-xs">{hasMorning ? '🌤 Morning' : ''}</span>
                </div>

                {morningAI?.enoughToday && (
                  <p className="text-[#374151] text-sm leading-relaxed border-l-2 border-[#C3E6D4] pl-3 mb-2">
                    {morningAI.enoughToday}
                  </p>
                )}

                {!morningAI?.enoughToday && entry.enoughStatement && (
                  <p className="text-[#374151] text-sm leading-relaxed border-l-2 border-[#C3E6D4] pl-3 mb-2">
                    {entry.enoughStatement}
                  </p>
                )}

                {eveningAI?.shutdownStatement && (
                  <p className="text-[#9CA3AF] text-xs mt-2 italic">{eveningAI.shutdownStatement}</p>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
