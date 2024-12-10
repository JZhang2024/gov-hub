import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { content, contentType } = await request.json();

    if (!content || !contentType) {
      return NextResponse.json(
        { error: 'Missing required parameters' }, 
        { status: 400 }
      );
    }

    const completion = await anthropic.beta.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      betas: ['pdfs-2024-09-25', 'prompt-caching-2024-07-31'],
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              media_type: contentType,
              type: 'base64',
              data: content,
            },
            cache_control: { type: 'ephemeral' },
          },
          {
            type: 'text',
            text: `Analyze this contract document and provide a concise summary focusing on:
            1. Key deliverables and requirements
            2. Important deadlines and submission dates
            3. Technical specifications or standards that must be met
            4. Qualification requirements (certifications, clearances, etc.)
            5. Evaluation criteria
            6. Any unique or special requirements (set-asides, restrictions, etc.)
            
            Format the summary in clear, concise points focusing only on the most critical information a contractor would need to understand the opportunity. Leave out any standard boilerplate or administrative details unless they are unusually important for this specific contract.`,
          },
        ],
      }],
    });

    return NextResponse.json({ 
      summary: completion.content
    });

  } catch (error) {
    console.error('Document summary error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to summarize document',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}