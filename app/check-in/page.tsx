'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'

const MOODS = [
  { label: 'Anxious', emoji: '😰' },
  { label: 'Heavy', emoji: '😔' },
  { label: 'Scattered', emoji: '🌀' },
  { label: 'Tired', emoji: '😴' },
  { label: 'Okay', emoji: '😐' },
  { label: 'Calm', emoji: '😌' },
  { label: 'Focused', emoji: '🎯' },
  { label: 'Good', emoji: '🙂' },
]

type MorningAI = {
  summary: string
  anxietyLoops: string[]
  priorities: string[]
  plan: string
  enoughToday: string
  groundingThought: string
}

export default function CheckInPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [mood, setMood] = useState('')
  const [energy, setEnergy] = useState(6)
  const [mindDump, setMindDump] = useState('')
  const [top3, setTop3] = useState(['', '', ''])
  const [enoughStatement, setEnoughStatement] = useState('')
  const [canWait, setCanWait] = useState('')
  const [avoiding, setAvoiding] = useState('')
  const [selfSupport, setSelfSupport] = useState('')

  const [loading, setLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<MorningAI | null>(null)
  const [error, setError] = useState('')

  const totalSteps = 5

  async function handleSubmit() {
    if (!session) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/daily-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, energyLevel: energy, mindDump, top3, enoughStatement, canWait, avoiding, selfSupport }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setAiResponse(data.aiResponse)
      setStep(6)
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

        {/* Progress bar */}
        {step <= totalSteps && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-[#9CA3AF]">Morning check-in</p>
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

        {/* Step 1: Mood + Energy */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-[#1C1C1E] mb-1">How do you feel right now?</h2>
            <p className="text-[#9CA3AF] text-sm mb-6">Choose the word that fits closest.</p>
            <div className="grid grid-cols-4 gap-2 mb-8">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setMood(m.label)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm transition-all ${
                    mood === m.label
                      ? 'border-[#7C6350] bg-[#F5EDE0] text-[#7C6350] font-medium'
                      : 'border-[#E8E2D9] bg-white text-[#374151] hover:border-[#D4C8BA]'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-[#374151]">Energy level</label>
                <span className="text-sm font-semibold text-[#7C6350]">{energy}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full accent-[#7C6350]"
              />
              <div className="flex justify-between text-xs text-[#9CA3AF] mt-1">
                <span>Depleted</span>
                <span>Full energy</span>
              </div>
            </div>

            <button
              disabled={!mood}
              onClick={() => setStep(2)}
              className="w-full py-3 bg-[#7C6350] text-white rounded-xl text-sm font-medium hover:bg-[#6B5444] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Mind dump */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-[#1C1C1E] mb-1">What's on your mind?</h2>
            <p className="text-[#9CA3AF] text-sm mb-6">Say everything. No filter. This is just for you.</p>
            <textarea
              value={mindDump}
              onChange={(e) => setMindDump(e.target.value)}
              placeholder="Work pressure, something I said, a decision I haven't made, a worry that keeps coming back..."
              className="w-full h-48 px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#1C1C1E] text-sm resize-none focus:border-[#7C6350] transition-colors"
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-[#E8E2D9] text-[#6B7280] rounded-xl text-sm hover:bg-white transition-colors">← Back</button>
              <button
                disabled={!mindDump.trim()}
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-[#7C6350] text-white rounded-xl text-sm font-medium hover:bg-[#6B5444] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Top 3 */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-[#1C1C1E] mb-1">What are the top 3 things that matter today?</h2>
            <p className="text-[#9CA3AF] text-sm mb-6">Just 3. Not the whole list. The things that actually matter.</p>
            <div className="space-y-3 mb-6">
              {top3.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#F5EDE0] text-[#7C6350] text-xs font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const updated = [...top3]
                      updated[i] = e.target.value
                      setTop3(updated)
                    }}
                    placeholder={i === 0 ? 'The most important thing' : i === 1 ? 'Second priority' : 'Third priority'}
                    className="flex-1 px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#1C1C1E] text-sm focus:border-[#7C6350] transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 border border-[#E8E2D9] text-[#6B7280] rounded-xl text-sm hover:bg-white transition-colors">← Back</button>
              <button
                disabled={!top3[0].trim()}
                onClick={() => setStep(4)}
                className="flex-1 py-3 bg-[#7C6350] text-white rounded-xl text-sm font-medium hover:bg-[#6B5444] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Enough + Can wait */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold text-[#1C1C1E] mb-1">Define enough for today</h2>
            <p className="text-[#9CA3AF] text-sm mb-6">What would make today feel complete? And what can wait?</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">What would make today "enough"?</label>
                <textarea
                  value={enoughStatement}
                  onChange={(e) => setEnoughStatement(e.target.value)}
                  placeholder="Today is enough if I finish the client update, do 45 min of focused work, and take a walk."
                  className="w-full h-24 px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#1C1C1E] text-sm resize-none focus:border-[#7C6350] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">What can wait?</label>
                <textarea
                  value={canWait}
                  onChange={(e) => setCanWait(e.target.value)}
                  placeholder="Long-term career planning, investment research, new tool exploration..."
                  className="w-full h-24 px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#1C1C1E] text-sm resize-none focus:border-[#7C6350] transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex-1 py-3 border border-[#E8E2D9] text-[#6B7280] rounded-xl text-sm hover:bg-white transition-colors">← Back</button>
              <button
                onClick={() => setStep(5)}
                className="flex-1 py-3 bg-[#7C6350] text-white rounded-xl text-sm font-medium hover:bg-[#6B5444] transition-colors"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Avoiding + Support */}
        {step === 5 && (
          <div>
            <h2 className="text-xl font-semibold text-[#1C1C1E] mb-1">Last two questions</h2>
            <p className="text-[#9CA3AF] text-sm mb-6">These help your AI give you a more grounded response.</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">What's one thing you're avoiding?</label>
                <input
                  type="text"
                  value={avoiding}
                  onChange={(e) => setAvoiding(e.target.value)}
                  placeholder="A difficult email, a decision, a conversation..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#1C1C1E] text-sm focus:border-[#7C6350] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">What support do you need from yourself today?</label>
                <input
                  type="text"
                  value={selfSupport}
                  onChange={(e) => setSelfSupport(e.target.value)}
                  placeholder="To be patient with myself, to start before I feel ready..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#1C1C1E] text-sm focus:border-[#7C6350] transition-colors"
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(4)} className="flex-1 py-3 border border-[#E8E2D9] text-[#6B7280] rounded-xl text-sm hover:bg-white transition-colors">← Back</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-[#7C6350] text-white rounded-xl text-sm font-medium hover:bg-[#6B5444] disabled:opacity-60 transition-colors"
              >
                {loading ? 'Getting your anchor...' : 'Get my anchor →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 6: AI Response */}
        {step === 6 && aiResponse && (
          <div>
            <div className="mb-6">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wide mb-1">Morning anchor</p>
              <h2 className="text-xl font-semibold text-[#1C1C1E]">Here's your focus for today</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
                <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">Mental state</p>
                <p className="text-[#374151] text-sm leading-relaxed">{aiResponse.summary}</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
                <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-3">Priorities</p>
                <ol className="space-y-2">
                  {aiResponse.priorities.map((p, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#374151]">
                      <span className="w-5 h-5 rounded-full bg-[#F5EDE0] text-[#7C6350] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      {p}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
                <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">Realistic plan</p>
                <p className="text-[#374151] text-sm leading-relaxed">{aiResponse.plan}</p>
              </div>

              <div className="bg-[#EAF5EF] rounded-2xl border border-[#C3E6D4] p-6">
                <p className="text-xs font-medium text-[#2D6A4F] uppercase tracking-wide mb-2">Enough for today</p>
                <p className="text-[#1C1C1E] text-sm leading-relaxed font-medium">{aiResponse.enoughToday}</p>
              </div>

              {aiResponse.anxietyLoops.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
                  <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-3">Loops to watch</p>
                  <div className="flex flex-wrap gap-2">
                    {aiResponse.anxietyLoops.map((loop, i) => (
                      <span key={i} className="px-3 py-1 bg-[#EEF2F7] text-[#4B5A72] text-xs rounded-full">{loop}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
                <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">Grounding thought</p>
                <p className="text-[#374151] text-sm italic leading-relaxed">&ldquo;{aiResponse.groundingThought}&rdquo;</p>
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

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#E8E2D9] border-t-[#7C6350] rounded-full animate-spin mb-4" />
            <p className="text-[#9CA3AF] text-sm">Building your anchor...</p>
          </div>
        )}

      </main>
    </div>
  )
}
