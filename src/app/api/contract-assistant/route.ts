import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { 
  AIRequestBody, 
  createSystemMessage 
} from '@/types/assistant-types';

// Export config for Edge runtime
export const runtime = 'edge';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

// Export POST handler
export async function POST(request: Request) {
  try {
    // Parse request body
    const body: AIRequestBody = await request.json();
    const { messages, context } = body;

    // Validate request data
    if (!Array.isArray(messages) || !Array.isArray(context)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Create system message with context
    const systemMessage = createSystemMessage(context);

    // Prepare messages for API call
    const apiMessages = [
      systemMessage,
      ...messages.filter(m => m.role === 'user' || m.role === 'assistant')
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "grok-beta",
      messages: apiMessages,
    });

    // Return response
    return NextResponse.json({
      message: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('Contract Assistant API Error:', error);
    
    // Return error response
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}