'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function FirecrawlDemo() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const [showRaw, setShowRaw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast.error('Please enter a URL to scrape');
      return;
    }
    
    setIsLoading(true);
    setMarkdownContent('');
    
    try {
      const response = await fetch('/api/firecrawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to scrape URL');
      }
      
      setMarkdownContent(result.data?.markdown || 'No markdown content found');
      toast.success('URL scraped successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to scrape URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Firecrawl Demo</h1>
      <p className="mb-4 text-gray-600">
        Enter a URL to scrape its content and convert it to Markdown using Firecrawl.
      </p>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter a URL to scrape (e.g., www.promptpromptprompt.com)"
            className="flex-grow px-4 py-2 border rounded-md"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Scraping...' : 'Scrape URL'}
          </button>
        </div>
      </form>
      
      {markdownContent && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Scraped Content</h2>
            <button 
              onClick={() => setShowRaw(!showRaw)}
              className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              {showRaw ? 'Show Rendered' : 'Show Raw Markdown'}
            </button>
          </div>
          
          {showRaw ? (
            <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[600px]">
              <pre className="whitespace-pre-wrap">{markdownContent}</pre>
            </div>
          ) : (
            <div className="bg-white border rounded-md p-6 overflow-auto max-h-[600px] prose prose-sm md:prose-base lg:prose-lg prose-slate max-w-none">
              <ReactMarkdown>{markdownContent}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 