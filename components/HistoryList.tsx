'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'

type MorningAI = {
  summary: string
  anxietyLoops: string[]
  priorities: string[]
  plan: string
  enoughToday: string
  groundingThought: string
}

type EveningAI = {
  doneList: string[]
  progressSummary: string
  selfCompassionReframe: string
  parkedWorries: string[]
  tomorrowPreview: string
  shutdownStatement: string
}

type Entry = {
  id: string
  date: string
  mood: string | null
  energyLevel: number | null
  mindDump: string | null
  top3: string | null
  enoughStatement: string | null
  canWait: string | null
  avoiding: string | null
  selfSupport: string | null
  aiMorningResponse: string | null
  eveningDone: string | null
  eveningUnfinished: string | null
  eveningProud: string | null
  eveningBlaming: string | null
  eveningParked: string | null
  eveningValues: string | null
  eveningEnough: string | null
  aiEveningResponse: string | null
}

function parseJson<T>(str: string | null, fallback: T): T {
  if (!str) return fallback
  try { return JSON.parse(str) as T } catch { return fallback }
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-[#374151] leading-relaxed">{value}</p>
    </div>
  )
}

function ListField({ label, items }: { label: string; items: string[] | null | undefined }) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">{label}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-[#374151]">
            <span className="text-[#7C6350] mt-0.5">·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function HistoryList({ entries }: { entries: Entry[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const morningAI = parseJson<MorningAI | null>(entry.aiMorningResponse, null)
        const eveningAI = parseJson<EveningAI | null>(entry.aiEveningResponse, null)
        const hasMorning = !!entry.mindDump
        const hasEvening = !!entry.eveningDone
        const isExpanded = expandedId === entry.id

        return (
          <div key={entry.id} className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden">
            <button
              onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              className="w-full text-left p-5 hover:bg-[#FAF8F5] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1C1C1E]">{formatDate(entry.date)}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
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
                <span className="text-[#9CA3AF] text-xs mt-0.5 ml-4 flex-shrink-0">
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>

              {!isExpanded && (
                <div className="mt-3">
                  {morningAI?.enoughToday && (
                    <p className="text-[#374151] text-sm leading-relaxed border-l-2 border-[#C3E6D4] pl-3 mb-2 line-clamp-2">
                      {morningAI.enoughToday}
                    </p>
                  )}
                  {!morningAI?.enoughToday && entry.enoughStatement && (
                    <p className="text-[#374151] text-sm leading-relaxed border-l-2 border-[#C3E6D4] pl-3 mb-2 line-clamp-2">
                      {entry.enoughStatement}
                    </p>
                  )}
                  {eveningAI?.shutdownStatement && (
                    <p className="text-[#9CA3AF] text-xs italic line-clamp-1">{eveningAI.shutdownStatement}</p>
                  )}
                </div>
              )}
            </button>

            {isExpanded && (
              <div className="border-t border-[#E8E2D9] px-5 pb-6">

                {hasMorning && (
                  <div className="pt-5">
                    <p className="text-xs font-semibold text-[#7C6350] uppercase tracking-wider mb-4">Morning check-in</p>
                    <div className="space-y-4">
                      <Field label="Mind dump" value={entry.mindDump} />
                      <Field label="Top 3 today" value={entry.top3} />
                      <Field label="Enough statement" value={entry.enoughStatement} />
                      <Field label="Can wait" value={entry.canWait} />
                      <Field label="Avoiding" value={entry.avoiding} />
                      <Field label="Self support" value={entry.selfSupport} />
                    </div>

                    {morningAI && (
                      <div className="mt-5 bg-[#FAF8F5] rounded-xl p-4 space-y-4">
                        <p className="text-xs font-semibold text-[#7C6350] uppercase tracking-wider">AI morning anchor</p>
                        <Field label="Summary" value={morningAI.summary} />
                        <ListField label="Anxiety loops noticed" items={morningAI.anxietyLoops} />
                        <ListField label="Priorities" items={morningAI.priorities} />
                        <Field label="Plan" value={morningAI.plan} />
                        <div className="bg-[#EAF5EF] rounded-lg p-3">
                          <Field label="Enough today" value={morningAI.enoughToday} />
                        </div>
                        <Field label="Grounding thought" value={morningAI.groundingThought} />
                      </div>
                    )}
                  </div>
                )}

                {hasEvening && (
                  <div className="pt-5">
                    {hasMorning && <div className="border-t border-[#E8E2D9] mb-5" />}
                    <p className="text-xs font-semibold text-[#7C6350] uppercase tracking-wider mb-4">Evening shutdown</p>
                    <div className="space-y-4">
                      <Field label="What I did" value={entry.eveningDone} />
                      <Field label="Unfinished" value={entry.eveningUnfinished} />
                      <Field label="Proud of" value={entry.eveningProud} />
                      <Field label="Self-blame" value={entry.eveningBlaming} />
                      <Field label="Parked until tomorrow" value={entry.eveningParked} />
                      <Field label="Values" value={entry.eveningValues} />
                      <Field label="Enough statement" value={entry.eveningEnough} />
                    </div>

                    {eveningAI && (
                      <div className="mt-5 bg-[#FAF8F5] rounded-xl p-4 space-y-4">
                        <p className="text-xs font-semibold text-[#7C6350] uppercase tracking-wider">AI evening response</p>
                        <ListField label="Done list" items={eveningAI.doneList} />
                        <Field label="Progress summary" value={eveningAI.progressSummary} />
                        {eveningAI.selfCompassionReframe && (
                          <div className="bg-[#EAF5EF] rounded-lg p-3">
                            <Field label="Reframe" value={eveningAI.selfCompassionReframe} />
                          </div>
                        )}
                        <ListField label="Parked worries" items={eveningAI.parkedWorries} />
                        <Field label="Tomorrow starts with" value={eveningAI.tomorrowPreview} />
                        <div className="bg-[#1C1C1E] rounded-lg p-4 text-center">
                          <p className="text-white text-sm leading-relaxed font-medium">{eveningAI.shutdownStatement}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!hasMorning && !hasEvening && (
                  <p className="pt-5 text-sm text-[#9CA3AF]">No details recorded for this day.</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
