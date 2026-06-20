'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Navigation } from '@/components/Navigation'

type ReframeAI = {
  emotion: string
  patterns: string[]
  balancedThought: string
  evidenceFor: string[]
  evidenceAgainst: string[]
  nextAction: string
  enoughStatement: string
}

export default function ReframePage() {
  const { data: session } = useSession()
  const [thought, setThought] = useState('')
  const [intensity, setIntensity] = useState(6)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReframeAI | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleSubmit() {
    if (!session || !thought.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/reframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawThought: thought, intensityBefore: intensity }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setResult(data.aiResponse)
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setThought('')
    setIntensity(6)
    setResult(null)
    setSaved(false)
    setError('')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">

        <div className="mb-8">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide mb-1">Thought Reframe</p>
          <h1 className="text-2xl font-semibold text-[#1C1C1E]">Examine what's bothering you</h1>
          <p className="text-[#6B7280] text-sm mt-1">Write the thought exactly as it feels. Your AI will help you see it more clearly.</p>
        </div>

        {!result && (
          <div>
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm mb-4">
              <label className="block text-sm font-medium text-[#374151] mb-3">
                What thought is troubling you?
              </label>
              <textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="I feel I am falling behind. Everyone else is doing more. I am wasting time."
                className="w-full h-36 text-[#1C1C1E] text-sm resize-none leading-relaxed bg-transparent"
              />
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-[#374151]">How intense does it feel?</label>
                <span className="text-sm font-semibold text-[#7C6350]">{intensity}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-[#7C6350]"
              />
              <div className="flex justify-between text-xs text-[#9CA3AF] mt-1">
                <span>Mild</span>
                <span>Very intense</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!thought.trim() || loading || !session}
              className="w-full py-3 bg-[#7C6350] text-white rounded-xl text-sm font-medium hover:bg-[#6B5444] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Examining...' : 'Reframe this thought →'}
            </button>

            {!session && (
              <p className="text-center text-[#9CA3AF] text-sm mt-3">Sign in to save your reframes</p>
            )}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#E8E2D9] border-t-[#7C6350] rounded-full animate-spin mb-4" />
            <p className="text-[#9CA3AF] text-sm">Looking at this more carefully...</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E2D9] p-5">
              <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">Your thought</p>
              <p className="text-[#374151] text-sm italic leading-relaxed">&ldquo;{thought}&rdquo;</p>
              <div className="flex gap-2 mt-3">
                <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] text-xs rounded-full capitalize">{result.emotion}</span>
                <span className="px-2 py-0.5 bg-[#EEF2F7] text-[#4B5A72] text-xs rounded-full">Intensity: {intensity}/10</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
              <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-3">Thinking patterns detected</p>
              <div className="flex flex-wrap gap-2">
                {result.patterns.map((p, i) => (
                  <span key={i} className="px-3 py-1 bg-[#FEF3C7] text-[#92400E] text-xs rounded-full">{p}</span>
                ))}
              </div>
            </div>

            <div className="bg-[#EAF5EF] rounded-2xl border border-[#C3E6D4] p-6">
              <p className="text-xs font-medium text-[#2D6A4F] uppercase tracking-wide mb-2">More balanced view</p>
              <p className="text-[#1C1C1E] text-sm leading-relaxed">{result.balancedThought}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 shadow-sm">
                <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-3">Evidence for</p>
                <ul className="space-y-2">
                  {result.evidenceFor.map((e, i) => (
                    <li key={i} className="flex gap-2 text-xs text-[#6B7280]">
                      <span className="text-[#F59E0B] mt-0.5">—</span>
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 shadow-sm">
                <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-3">Evidence against</p>
                <ul className="space-y-2">
                  {result.evidenceAgainst.map((e, i) => (
                    <li key={i} className="flex gap-2 text-xs text-[#6B7280]">
                      <span className="text-[#34D399] mt-0.5">—</span>
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
              <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">One next action</p>
              <p className="text-[#1C1C1E] text-sm font-medium">{result.nextAction}</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
              <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">Enough statement</p>
              <p className="text-[#374151] text-sm italic leading-relaxed">&ldquo;{result.enoughStatement}&rdquo;</p>
            </div>

            {saved && (
              <p className="text-center text-xs text-[#9CA3AF]">Saved to your history</p>
            )}

            <button
              onClick={handleReset}
              className="w-full py-3 border border-[#E8E2D9] text-[#6B7280] rounded-xl text-sm hover:bg-white transition-colors"
            >
              Reframe another thought
            </button>
          </div>
        )}

      </main>
    </div>
  )
}
