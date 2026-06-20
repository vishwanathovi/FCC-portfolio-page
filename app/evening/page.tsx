'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'

type EveningAI = {
  doneList: string[]
  progressSummary: string
  selfCompassionReframe: string
  parkedWorries: string[]
  tomorrowPreview: string
  shutdownStatement: string
}

export default function EveningPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [done, setDone] = useState('')
  const [unfinished, setUnfinished] = useState('')
  const [proud, setProud] = useState('')
  const [blaming, setBlaming] = useState('')
  const [parked, setParked] = useState('')
  const [values, setValues] = useState('')
  const [eveningEnough, setEveningEnough] = useState('')

  const [loading, setLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<EveningAI | null>(null)
  const [error, setError] = useState('')

  const totalSteps = 3

  async function handleSubmit() {
    if (!session) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/evening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eveningDone: done, eveningUnfinished: unfinished, eveningProud: proud, eveningBlaming: blaming, eveningParked: parked, eveningValues: values, eveningEnough }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setAiResponse(data.aiResponse)
      setStep(4)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#6B7280]">Sign in to continue</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">

        {step <= totalSteps && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-[#9CA3AF]">Evening shutdown</p>
              <p className="text-xs text-[#9CA3AF]">{step} of {totalSteps}</p>
            </div>
            <div className="h-1 bg-[#E8E2D9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7C6350] rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-[#1C1C1E] mb-1">What happened today?</h2>
            <p className="text-[#9CA3AF] text-sm mb-6">Just what you did and what didn't get done. No judgment yet.</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">What did you do today?</label>
                <textarea
                  value={done}
                  onChange={(e) => setDone(e.target.value)}
                  placeholder="Finished the client report, had a team call, responded to urgent emails, took a walk..."
                  className="w-full h-28 px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#1C1C1E] text-sm resize-none focus:border-[#7C6350] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">What remained unfinished?</label>
                <textarea
                  value={unfinished}
                  onChange={(e) => setUnfinished(e.target.value)}
                  placeholder="The side project, the long email I've been postponing, gym session..."
                  className="w-full h-24 px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#1C1C1E] text-sm resize-none focus:border-[#7C6350] transition-colors"
                />
              </div>
            </div>
            <button
              disabled={!done.trim()}
              onClick={() => setStep(2)}
              className="w-full py-3 bg-[#7C6350] text-white rounded-xl text-sm font-medium hover:bg-[#6B5444] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-[#1C1C1E] mb-1">How do you feel about today?</h2>
            <p className="text-[#9CA3AF] text-sm mb-6">Be honest. This is what your AI needs to give you a real response.</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">What are you proud of?</label>
                <textarea
                  value={proud}
                  onChange={(e) => setProud(e.target.value)}
                  placeholder="Even small things count. Showing up, not quitting, one kind action..."
                  className="w-full h-24 px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#1C1C1E] text-sm resize-none focus:border-[#7C6350] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">What are you blaming yourself for?</label>
                <textarea
                  value={blaming}
                  onChange={(e) => setBlaming(e.target.value)}
                  placeholder="Not finishing X, scrolling too much, getting distracted, being reactive..."
                  className="w-full h-24 px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#1C1C1E] text-sm resize-none focus:border-[#7C6350] transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-[#E8E2D9] text-[#6B7280] rounded-xl text-sm hover:bg-white transition-colors">← Back</button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-[#7C6350] text-white rounded-xl text-sm font-medium hover:bg-[#6B5444] transition-colors"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-[#1C1C1E] mb-1">Park and close</h2>
            <p className="text-[#9CA3AF] text-sm mb-6">Let's put things down so your mind can rest.</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">What can be parked until tomorrow?</label>
                <textarea
                  value={parked}
                  onChange={(e) => setParked(e.target.value)}
                  placeholder="The decision I haven't made, the worry about next week, the plan I haven't started..."
                  className="w-full h-24 px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#1C1C1E] text-sm resize-none focus:border-[#7C6350] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Did you live according to your values today? (optional)</label>
                <input
                  type="text"
                  value={values}
                  onChange={(e) => setValues(e.target.value)}
                  placeholder="Growth, health, family, responsibility..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#1C1C1E] text-sm focus:border-[#7C6350] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">What's your "enough" statement for today? (optional)</label>
                <input
                  type="text"
                  value={eveningEnough}
                  onChange={(e) => setEveningEnough(e.target.value)}
                  placeholder="Today was enough because..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#1C1C1E] text-sm focus:border-[#7C6350] transition-colors"
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 border border-[#E8E2D9] text-[#6B7280] rounded-xl text-sm hover:bg-white transition-colors">← Back</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-[#7C6350] text-white rounded-xl text-sm font-medium hover:bg-[#6B5444] disabled:opacity-60 transition-colors"
              >
                {loading ? 'Closing the day...' : 'Close the day →'}
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#E8E2D9] border-t-[#7C6350] rounded-full animate-spin mb-4" />
            <p className="text-[#9CA3AF] text-sm">Closing the day...</p>
          </div>
        )}

        {step === 4 && aiResponse && (
          <div>
            <div className="mb-6">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wide mb-1">Evening closure</p>
              <h2 className="text-xl font-semibold text-[#1C1C1E]">Today is complete</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
                <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-3">What you did</p>
                <ul className="space-y-1 mb-4">
                  {aiResponse.doneList.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#374151]">
                      <span className="text-[#34D399] mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-[#6B7280] text-sm leading-relaxed border-t border-[#E8E2D9] pt-4">{aiResponse.progressSummary}</p>
              </div>

              {aiResponse.selfCompassionReframe && (
                <div className="bg-[#EAF5EF] rounded-2xl border border-[#C3E6D4] p-6">
                  <p className="text-xs font-medium text-[#2D6A4F] uppercase tracking-wide mb-2">Reframe</p>
                  <p className="text-[#1C1C1E] text-sm leading-relaxed">{aiResponse.selfCompassionReframe}</p>
                </div>
              )}

              {aiResponse.parkedWorries.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
                  <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-3">Parked until tomorrow</p>
                  <ul className="space-y-2">
                    {aiResponse.parkedWorries.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[#6B7280]">
                        <span className="text-[#D1C9BF] mt-0.5">○</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
                <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">Tomorrow starts with</p>
                <p className="text-[#374151] text-sm">{aiResponse.tomorrowPreview}</p>
              </div>

              <div className="bg-[#1C1C1E] rounded-2xl p-6 text-center">
                <p className="text-white text-base leading-relaxed font-medium">{aiResponse.shutdownStatement}</p>
                <p className="text-[#9CA3AF] text-xs mt-3">You are done for today. 🌙</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className="w-full mt-6 py-3 border border-[#E8E2D9] text-[#6B7280] rounded-xl text-sm hover:bg-white transition-colors"
            >
              Back to home
            </button>
          </div>
        )}

      </main>
    </div>
  )
}
