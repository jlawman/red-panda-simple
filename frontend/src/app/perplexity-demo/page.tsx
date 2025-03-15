'use client';

import { useState } from 'react';

// Define TypeScript interfaces for the Perplexity API response
interface PerplexityMessage {
  role: string;
  content: string;
}

interface PerplexityChoice {
  index: number;
  finish_reason: string;
  message: PerplexityMessage;
  delta: {
    role: string;
    content: string;
  };
}

interface PerplexityUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  citation_tokens?: number;
  num_search_queries?: number;
  reasoning_tokens?: number;
}

interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  usage: PerplexityUsage;
  citations?: string[];
  related_questions?: string[];
  object: string;
  choices: PerplexityChoice[];
}

// Define interface for the renderContent return type
interface RenderContentResult {
  formattedContent: JSX.Element;
  thinking: string;
}

export default function PerplexityDemo() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<PerplexityResponse | null>(null);
  const [rawResponse, setRawResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState<'regular' | 'deep'>('regular');
  const [showThinking, setShowThinking] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setResponse(null);
    setRawResponse('');
    setShowThinking(false);
    
    const endpoint = searchType === 'regular' 
      ? '/api/perplexity-search' 
      : '/api/perplexity-deep-research';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      
      const data = await res.json();
      setRawResponse(JSON.stringify(data, null, 2));
      setResponse(data as PerplexityResponse);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to extract thinking content from <think> tags
  const extractThinkingContent = (content: string): { thinking: string, response: string } => {
    const thinkRegex = /<think>([\s\S]*?)<\/think>/;
    const match = content.match(thinkRegex);
    
    if (match && match[1]) {
      // Return both the thinking content and the cleaned response
      return {
        thinking: match[1].trim(),
        response: content.replace(thinkRegex, '').trim()
      };
    }
    
    // If no thinking tags found, return original content
    return {
      thinking: '',
      response: content
    };
  };

  // Function to render markdown content with basic formatting and clickable citations
  const renderContent = (content: string, citations?: string[]): RenderContentResult => {
    if (!content) return {
      formattedContent: <div>No content available</div>,
      thinking: ''
    };
    
    // Extract thinking content if present
    const { thinking, response } = extractThinkingContent(content);
    
    // First, handle bold text formatting
    let formattedContent = response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Then, make citation numbers clickable if citations are available
    if (citations && citations.length > 0) {
      // Replace citation numbers like [1], [2], etc. with clickable links
      formattedContent = formattedContent.replace(/\[(\d+)\]/g, (match, citationNumber) => {
        const index = parseInt(citationNumber, 10) - 1;
        if (index >= 0 && index < citations.length) {
          return `<a href="${citations[index]}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">[${citationNumber}]</a>`;
        }
        return match; // Keep original if citation doesn't exist
      });
    }
    
    // Handle newlines
    formattedContent = formattedContent.replace(/\n/g, '<br />');
    
    return {
      formattedContent: <div dangerouslySetInnerHTML={{ __html: formattedContent }} />,
      thinking: thinking
    };
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Perplexity AI Search Demo</h1>
      <p className="mb-6">
        Note: Deep research usually takes longer and should be run on modal.com.
      </p>
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex items-center">
            <input
              id="regular-search"
              type="radio"
              name="search-type"
              checked={searchType === 'regular'}
              onChange={() => setSearchType('regular')}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="regular-search" className="ml-2 text-sm font-medium">
              Regular Search (sonar)
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="deep-research"
              type="radio"
              name="search-type"
              checked={searchType === 'deep'}
              onChange={() => setSearchType('deep')}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="deep-research" className="ml-2 text-sm font-medium">
              Deep Research (sonar-deep-research)
            </label>
          </div>
        </div>
        
        <label htmlFor="query" className="block text-sm font-medium mb-2">
          Enter your search query:
        </label>
        <div className="flex gap-2">
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-md"
            placeholder={searchType === 'regular' ? "How many stars are there in our galaxy?" : "What are the latest advancements in quantum computing?"}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {searchType === 'regular' 
            ? 'Regular search provides concise answers with basic citations.' 
            : 'Deep research provides comprehensive answers with detailed citations and related questions.'}
        </p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {response && (
        <div className="mt-6 space-y-6">
          {/* Structured Response */}
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Structured Response</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Answer:</h3>
              {response.choices && response.choices[0] && (() => {
                const content = response.choices[0].message.content;
                const { formattedContent, thinking } = renderContent(content, response.citations);
                
                return (
                  <>
                    <div className="p-4 bg-gray-50 rounded-md">
                      {formattedContent}
                    </div>
                    
                    {thinking && (
                      <div className="mt-4">
                        <button
                          onClick={() => setShowThinking(!showThinking)}
                          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                          <svg 
                            className={`w-4 h-4 mr-1 transition-transform ${showThinking ? 'rotate-90' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {showThinking ? 'Hide thinking process' : 'Show thinking process'}
                        </button>
                        
                        {showThinking && (
                          <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm whitespace-pre-wrap">
                            {thinking}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            
            {response.citations && response.citations.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">References:</h3>
                <ul className="list-decimal pl-5 space-y-1">
                  {response.citations.map((citation, index) => (
                    <li key={index}>
                      <a 
                        href={citation} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {citation}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {response.related_questions && response.related_questions.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Related Questions:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {response.related_questions.map((question, index) => (
                    <li key={index} className="text-gray-700">
                      {question}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div>Model: <span className="font-medium">{response.model}</span></div>
                <div>Tokens: <span className="font-medium">{response.usage?.total_tokens || 'N/A'}</span></div>
                {response.usage?.reasoning_tokens && (
                  <div>Reasoning Tokens: <span className="font-medium">{response.usage.reasoning_tokens}</span></div>
                )}
                <div>Time: <span className="font-medium">{new Date(response.created * 1000).toLocaleString()}</span></div>
              </div>
            </div>
          </div>
          
          {/* Raw Response */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Raw Response:</h2>
            <pre className="p-4 bg-gray-100 rounded-md overflow-auto max-h-96 text-sm">
              {rawResponse}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}