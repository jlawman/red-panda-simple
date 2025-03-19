import { NextRequest, NextResponse } from 'next/server';
import FireCrawlApp from '@mendable/firecrawl-js';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    const apiKey = process.env.FIRECRAWL_API_KEY;
    const app = new FireCrawlApp({ apiKey });
    
    const scrapeResult = await app.scrapeUrl(url, {
      formats: ["markdown"],
    });
    
    return NextResponse.json({ 
      success: true, 
      data: scrapeResult 
    });
  } catch (error: unknown) {
    console.error('Error scraping URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape URL';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
} 