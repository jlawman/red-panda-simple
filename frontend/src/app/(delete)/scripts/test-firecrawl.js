// This is a simple script to test the Firecrawl integration directly
// Run with: npx tsx src/scripts/test-firecrawl.js

import FireCrawlApp from '@mendable/firecrawl-js';

async function testFirecrawl() {
  console.log('Testing Firecrawl integration...');
  
  const apiKey = process.env.FIRECRAWL_API_KEY || 'fc-b353d22638b744f78ce3437c86bc5480';
  console.log(`Using API key: ${apiKey.substring(0, 8)}...`);
  
  const app = new FireCrawlApp({ apiKey });
  
  try {
    console.log('Scraping www.promptpromptprompt.com...');
    const result = await app.scrapeUrl('www.promptpromptprompt.com', {
      formats: ['markdown'],
    });
    
    console.log('Scrape successful!');
    console.log('Result type:', typeof result);
    console.log('Result keys:', Object.keys(result));
    
    // Print a snippet of the markdown
    if (result.markdown) {
      console.log('\nMarkdown snippet (first 300 characters):');
      console.log(result.markdown.substring(0, 300) + '...');
    } else {
      console.log('No markdown content found in the result');
    }
  } catch (error) {
    console.error('Error scraping URL:', error);
  }
}

testFirecrawl().catch(console.error); 