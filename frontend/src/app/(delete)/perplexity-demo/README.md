# Perplexity AI Search Demo

This is a demo page that demonstrates how to use the Perplexity AI API for search queries.

## Features

- Two search modes:
  - Regular Search (sonar model) - Quick, concise answers
  - Deep Research (sonar-deep-research model) - Comprehensive answers with 128k context window
- Simple search interface to query the Perplexity AI API
- Displays both structured and raw API responses
- Renders formatted content with bold text support
- Interactive citations:
  - Clickable citation numbers in the text (e.g., [1], [2]) that link directly to sources
  - Complete reference list with clickable links
- Displays related questions (for deep research mode)
- Displays metadata like model, token usage, and timestamp
- Reveals AI thinking process:
  - Expandable section showing the model's reasoning (when available)
  - Extracted from `<think>` tags in the response
  - Helps understand how the AI arrived at its conclusions

## Setup

1. Make sure you have a Perplexity API key. You can get one from [Perplexity AI's website](https://www.perplexity.ai/).

2. Add your API key to your environment variables:
   - Create or update your `.env.local` file in the root of your project
   - Add the following line:
   ```
   PERPLEXITY_API_KEY=your_api_key_here
   ```

3. Restart your development server if it's already running.

## How to Use

1. Navigate to `/perplexity-demo` in your browser.
2. Select the search mode:
   - Regular Search: For quick, concise answers
   - Deep Research: For comprehensive, well-researched answers
3. Enter a search query in the input field.
4. Click the "Search" button.
5. The response from the Perplexity API will be displayed in two formats:
   - A structured view with formatted answer, clickable citation numbers, references, related questions (for deep research), and metadata
   - The raw JSON response for debugging purposes
6. If the response contains thinking process data (in `<think>` tags), you'll see a "Show thinking process" button that reveals the AI's reasoning when clicked.

## API Routes

### Regular Search

The regular search API route is located at `/api/perplexity-search`. It uses the "sonar" model and provides concise answers.

Example:
```javascript
fetch('/api/perplexity-search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: 'How many moons does Jupiter have?' }),
})
.then(response => response.json())
.then(data => console.log(data));
```

### Deep Research

The deep research API route is located at `/api/perplexity-deep-research`. It uses the "sonar-deep-research" model with a 128k context window for more comprehensive answers.

Example:
```javascript
fetch('/api/perplexity-deep-research', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: 'What are the latest advancements in quantum computing?' }),
})
.then(response => response.json())
.then(data => console.log(data));
```

## Response Format

The Perplexity API returns a response in the following format:

```json
{
  "id": "8e4088cb-5efc-4914-9faf-fd1fb1eac2c9",
  "model": "sonar-deep-research",
  "created": 1742034772,
  "usage": {
    "prompt_tokens": 11,
    "completion_tokens": 42,
    "total_tokens": 53,
    "citation_tokens": 5582,
    "num_search_queries": 4,
    "reasoning_tokens": 15246
  },
  "citations": [
    "https://www.space.com/16452-jupiters-moons.html",
    "https://en.wikipedia.org/wiki/Moons_of_Jupiter"
  ],
  "related_questions": [
    "How many of Jupiter's moons are named?",
    "Which is the largest moon of Jupiter?",
    "When was the most recent moon of Jupiter discovered?"
  ],
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "finish_reason": "stop",
      "message": {
        "role": "assistant",
        "content": "<think>This is the AI's thinking process that will be hidden by default and can be expanded by the user.</think>Jupiter has **95 confirmed moons** as of February 2024[1]. The largest moon is Ganymede[2]."
      },
      "delta": {
        "role": "assistant",
        "content": ""
      }
    }
  ]
}
```

Note: 
- The `related_questions` field is only available in the deep research response.
- Citation numbers in the content (like [1], [2]) are automatically converted to clickable links that point to the corresponding URL in the citations array.
- The `<think>` tags and their content are extracted and displayed in an expandable section when available.
- Deep research responses include additional usage metrics like `citation_tokens`, `num_search_queries`, and `reasoning_tokens`.

## Customization

You can customize the API parameters by modifying the route files:
- Regular search: `/api/perplexity-search/route.ts`
- Deep research: `/api/perplexity-deep-research/route.ts` 