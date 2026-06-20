import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai, EVENING_SYSTEM_PROMPT } from '@/lib/openai'
import { getTodayDate } from '@/lib/utils'
import { z } from 'zod'

const schema = z.object({
  eveningDone: z.string().min(1),
  eveningUnfinished: z.string().optional(),
  eveningProud: z.string().optional(),
  eveningBlaming: z.string().optional(),
  eveningParked: z.string().optional(),
  eveningValues: z.string().optional(),
  eveningEnough: z.string().optional(),
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
What I did today: ${data.eveningDone}
What remained unfinished: ${data.eveningUnfinished || 'not specified'}
What I'm proud of: ${data.eveningProud || 'not specified'}
What I'm blaming myself for: ${data.eveningBlaming || 'not specified'}
What can be parked: ${data.eveningParked || 'not specified'}
Values alignment today: ${data.eveningValues || 'not specified'}
My enough statement: ${data.eveningEnough || 'not specified'}
`.trim()

  let aiResponse = null
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: EVENING_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 700,
      response_format: { type: 'json_object' },
    })
    const content = completion.choices[0]?.message?.content
    if (content) aiResponse = JSON.parse(content)
  } catch (e) {
    console.error('OpenAI error:', e)
  }

  await prisma.dailyEntry.upsert({
    where: { userId_date: { userId: session.user.id, date: today } },
    create: {
      userId: session.user.id,
      date: today,
      eveningDone: data.eveningDone,
      eveningUnfinished: data.eveningUnfinished,
      eveningProud: data.eveningProud,
      eveningBlaming: data.eveningBlaming,
      eveningParked: data.eveningParked,
      eveningValues: data.eveningValues,
      eveningEnough: data.eveningEnough,
      aiEveningResponse: aiResponse ? JSON.stringify(aiResponse) : null,
    },
    update: {
      eveningDone: data.eveningDone,
      eveningUnfinished: data.eveningUnfinished,
      eveningProud: data.eveningProud,
      eveningBlaming: data.eveningBlaming,
      eveningParked: data.eveningParked,
      eveningValues: data.eveningValues,
      eveningEnough: data.eveningEnough,
      aiEveningResponse: aiResponse ? JSON.stringify(aiResponse) : null,
    },
  })

  return NextResponse.json({ aiResponse })
}
