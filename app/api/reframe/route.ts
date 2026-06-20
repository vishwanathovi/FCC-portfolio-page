import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai, REFRAME_SYSTEM_PROMPT } from '@/lib/openai'
import { z } from 'zod'

const schema = z.object({
  rawThought: z.string().min(1),
  intensityBefore: z.number().min(1).max(10).optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { rawThought, intensityBefore } = parsed.data

  const userPrompt = `
Thought: ${rawThought}
Intensity: ${intensityBefore ?? 'not rated'}/10
`.trim()

  let aiResponse = null
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: REFRAME_SYSTEM_PROMPT },
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
    return NextResponse.json({ error: 'AI service unavailable. Your thought has been saved.' }, { status: 503 })
  }

  await prisma.thought.create({
    data: {
      userId: session.user.id,
      rawThought,
      intensityBefore,
      aiResponse: aiResponse ? JSON.stringify(aiResponse) : null,
    },
  })

  return NextResponse.json({ aiResponse })
}
