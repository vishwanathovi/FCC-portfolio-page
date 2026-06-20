import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navigation } from '@/components/Navigation'
import { getTodayDate, parseJsonField } from '@/lib/utils'

type MorningAI = {
  summary: string
  anxietyLoops: string[]
  priorities: string[]
  plan: string
  enoughToday: string
  groundingThought: string
}

type EveningAI = {
  shutdownStatement: string
  progressSummary: string
}

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/signin')

  const today = getTodayDate()
  const entry = await prisma.dailyEntry.findUnique({
    where: { userId_date: { userId: session.user.id, date: today } },
  })

  const morningAI = parseJsonField<MorningAI | null>(entry?.aiMorningResponse, null)
  const eveningAI = parseJsonField<EveningAI | null>(entry?.aiEveningResponse, null)
  const top3 = parseJsonField<string[]>(entry?.top3, [])

  const hasMorning = !!entry?.mindDump
  const hasEvening = !!entry?.eveningDone

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">

        {/* Date + greeting */}
        <div className="mb-8">
          <p className="text-[#9CA3AF] text-sm mb-1">{todayFormatted}</p>
          <h1 className="text-2xl font-semibold text-[#1C1C1E]">
            {hasMorning ? "Today's Anchor" : `Hello, ${session.user.name?.split(' ')[0] ?? 'you'}`}
          </h1>
        </div>

        {/* No morning entry yet */}
        {!hasMorning && (
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-8 text-center shadow-sm mb-6">
            <div className="text-3xl mb-4">🌤</div>
            <h2 className="text-lg font-medium text-[#1C1C1E] mb-2">Start your morning check-in</h2>
            <p className="text-[#6B7280] text-sm mb-6 max-w-xs mx-auto">
              7 questions. 5 minutes. Your AI summary will help you focus on what actually matters today.
            </p>
            <Link
              href="/check-in"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7C6350] text-white rounded-xl text-sm font-medium hover:bg-[#6B5444] transition-colors"
            >
              Begin morning check-in →
            </Link>
          </div>
        )}

        {/* Morning entry done — show anchor */}
        {hasMorning && morningAI && (
          <div className="space-y-4 mb-6">

            {/* Mental state */}
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
              <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">Mental state</p>
              <p className="text-[#374151] text-sm leading-relaxed">{morningAI.summary}</p>
            </div>

            {/* Priorities */}
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
              <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-3">Today's priorities</p>
              <ol className="space-y-2">
                {morningAI.priorities.map((p, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[#374151]">
                    <span className="w-5 h-5 rounded-full bg-[#F5EDE0] text-[#7C6350] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    {p}
                  </li>
                ))}
              </ol>
            </div>

            {/* Enough statement */}
            <div className="bg-[#EAF5EF] rounded-2xl border border-[#C3E6D4] p-6">
              <p className="text-xs font-medium text-[#2D6A4F] uppercase tracking-wide mb-2">Enough for today</p>
              <p className="text-[#1C1C1E] text-sm leading-relaxed font-medium">{morningAI.enoughToday}</p>
            </div>

            {/* Anxiety loops */}
            {morningAI.anxietyLoops.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
                <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-3">Loops to watch</p>
                <div className="flex flex-wrap gap-2">
                  {morningAI.anxietyLoops.map((loop, i) => (
                    <span key={i} className="px-3 py-1 bg-[#EEF2F7] text-[#4B5A72] text-xs rounded-full">{loop}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Grounding thought */}
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
              <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">Grounding thought</p>
              <p className="text-[#374151] text-sm italic leading-relaxed">&ldquo;{morningAI.groundingThought}&rdquo;</p>
            </div>
          </div>
        )}

        {/* Top 3 from form (if no AI yet) */}
        {hasMorning && !morningAI && top3.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm mb-4">
            <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-3">Today's top 3</p>
            <ol className="space-y-2">
              {top3.filter(Boolean).map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-[#374151]">
                  <span className="w-5 h-5 rounded-full bg-[#F5EDE0] text-[#7C6350] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Link
            href="/reframe"
            className="bg-white rounded-xl border border-[#E8E2D9] p-4 hover:border-[#D4C8BA] hover:shadow-sm transition-all"
          >
            <p className="text-lg mb-1">🔁</p>
            <p className="text-sm font-medium text-[#1C1C1E]">Reframe a thought</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Examine what's bothering you</p>
          </Link>
          <Link
            href="/evening"
            className={`rounded-xl border p-4 transition-all ${
              hasEvening
                ? 'bg-[#EAF5EF] border-[#C3E6D4]'
                : 'bg-white border-[#E8E2D9] hover:border-[#D4C8BA] hover:shadow-sm'
            }`}
          >
            <p className="text-lg mb-1">{hasEvening ? '✓' : '🌙'}</p>
            <p className="text-sm font-medium text-[#1C1C1E]">
              {hasEvening ? 'Day closed' : 'Close the day'}
            </p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {hasEvening ? eveningAI?.shutdownStatement?.slice(0, 40) + '…' : 'Evening shutdown'}
            </p>
          </Link>
        </div>

      </main>
      <footer className="text-center py-6 text-[#C4BDB5] text-xs">
        enough · private · just for you
      </footer>
    </div>
  )
}
