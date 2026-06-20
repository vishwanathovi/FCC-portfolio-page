import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai, MORNING_SYSTEM_PROMPT } from '@/lib/openai'
import { getTodayDate } from '@/lib/utils'
import { z } from 'zod'

const schema = z.object({
  mood: z.string().optional(),
  energyLevel: z.number().min(1).max(10).optional(),
  mindDump: z.string().min(1),
  top3: z.array(z.string()).length(3),
  enoughStatement: z.string().optional(),
  canWait: z.string().optional(),
  avoiding: z.string().optional(),
  selfSupport: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const data = parsed.data
  const today = getTodayDate()

  const userPrompt = `
Mood: ${data.mood || 'not specified'}
Energy: ${data.energyLevel}/10
What's on my mind: ${data.mindDump}
Top 3 things that matter today: ${data.top3.filter(Boolean).join(', ')}
What would make today enough: ${data.enoughStatement || 'not specified'}
What can wait: ${data.canWait || 'not specified'}
What I'm avoiding: ${data.avoiding || 'not specified'}
Support I need from myself: ${data.selfSupport || 'not specified'}
`.trim()

  let aiResponse = null
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: MORNING_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    })
    const content = completion.choices[0]?.message?.content
    if (content) aiResponse = JSON.parse(content)
  } catch (e) {
    console.error('OpenAI error:', e)
  }

  const entry = await prisma.dailyEntry.upsert({
    where: { userId_date: { userId: session.user.id, date: today } },
    create: {
      userId: session.user.id,
      date: today,
      mood: data.mood,
      energyLevel: data.energyLevel,
      mindDump: data.mindDump,
      top3: JSON.stringify(data.top3),
      enoughStatement: data.enoughStatement,
      canWait: data.canWait,
      avoiding: data.avoiding,
      selfSupport: data.selfSupport,
      aiMorningResponse: aiResponse ? JSON.stringify(aiResponse) : null,
    },
    update: {
      mood: data.mood,
      energyLevel: data.energyLevel,
      mindDump: data.mindDump,
      top3: JSON.stringify(data.top3),
      enoughStatement: data.enoughStatement,
      canWait: data.canWait,
      avoiding: data.avoiding,
      selfSupport: data.selfSupport,
      aiMorningResponse: aiResponse ? JSON.stringify(aiResponse) : null,
    },
  })

  return NextResponse.json({ entry, aiResponse })
}
