import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { 
  AIRequestBody, 
  createSystemMessage 
} from '@/types/assistant-types';

const openai = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: "https://api.x.ai/v1",
  });

export async function POST(req: Request) {
  try {
    const body: AIRequestBody = await req.json();
    const { messages, context } = body;

    // Validate the request
    if (!Array.isArray(messages) || !Array.isArray(context)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400 }
      );
    }

    // Create the system message with context
    const systemMessage = createSystemMessage(context);

    // Prepare the messages array for the API
    const apiMessages = [
      systemMessage,
      ...messages.filter(m => m.role === 'user' || m.role === 'assistant')
    ];

    // Make API call to OpenAI with the messages array
    const completion = await openai.chat.completions.create({
        model: "grok-beta",
        messages: apiMessages,
      });

    
    return new NextResponse(
        JSON.stringify({ message: completion.choices[0].message.content }),
        { status: 200 }
        );

  } catch (error) {
    console.error('Contract Assistant API Error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
}