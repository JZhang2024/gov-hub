import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { 
  AIRequestBody, 
  createSystemMessage 
} from '@/types/assistant-types';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export async function POST(request: Request) {
  try {
    const body: AIRequestBody = await request.json();
    const { messages, context } = body;

    if (!Array.isArray(messages) || !Array.isArray(context)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const systemMessage = createSystemMessage(context);
    const apiMessages = [
      systemMessage,
      ...messages.filter(m => m.role === 'user' || m.role === 'assistant')
    ];

    // Create a new TransformStream for streaming
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start the completion stream
    const completion = await openai.chat.completions.create({
      model: "grok-beta",
      messages: apiMessages,
      stream: true,
    });

    // Process the stream
    (async () => {
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
        }
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        console.error('Streaming error:', error);
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Contract Assistant API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}