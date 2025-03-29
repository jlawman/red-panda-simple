// npm install @google/genai

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { logger } from '@/lib/braintrustlogger';

const googleAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

async function processGoogleAIRequest(
  message: string,
  model: string = "gemini-2.0-flash"
) {
  const ai = googleAI;
  
  const response = await ai.models.generateContent({
    model: model,
    contents: message,
  });

  const content = response.text || '';
  const xmlTags = content.match(/<(\w+)>([\s\S]*?)<\/\1>/g) || [];
  const xmlContents: { [key: string]: string } = {};

  xmlTags.forEach(tag => {
    const match = tag.match(/<(\w+)>([\s\S]*?)<\/\1>/);
    if (match) {
      const [, tagName, tagContent] = match;
      xmlContents[tagName] = tagContent.trim();
    }
  });

  return {
    llmResponse: content,
    extractedContents: xmlContents
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { message, model = "gemini-2.0-flash" } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const result = await processGoogleAIRequest(message, model);

    // Log asynchronously without waiting
    logger.traced(async (span) => {
      span.log({
        input: { message, model },
        output: result,
        tags: ['google', 'request', 'response']
      });
    }, { name: 'ask_google' }).catch(console.error);

    return NextResponse.json(result.extractedContents);
  } catch (error) {
    console.error('Error processing request:', error);
    
    // Log error asynchronously
    logger.traced(async (span) => {
      span.log({
        error: error instanceof Error ? error.message : 'Unknown error',
        tags: ['error', error instanceof Error ? 'known' : 'unknown']
      });
    }, { name: 'ask_google_error' }).catch(console.error);

    if (error instanceof Error) {
      return NextResponse.json({ error: `Error processing request: ${error.message}` }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred while processing the request' }, { status: 500 });
    }
  }
}
