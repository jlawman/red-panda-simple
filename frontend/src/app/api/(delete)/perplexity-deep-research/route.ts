import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { error: 'Perplexity API key is not configured' },
        { status: 500 }
      );
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "sonar-deep-research",
        messages: [
          { role: "system", content: "You are a research assistant. Provide comprehensive, well-researched answers with citations." },
          { role: "user", content: query }
        ],
        max_tokens: 8000,
        temperature: 0.2,
        top_p: 0.9,
        search_domain_filter: null,
        return_images: false,
        return_related_questions: true,
        search_recency_filter: null,
        top_k: 0,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1,
        response_format: null
      })
    };
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', options);
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Perplexity API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Perplexity deep research:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 