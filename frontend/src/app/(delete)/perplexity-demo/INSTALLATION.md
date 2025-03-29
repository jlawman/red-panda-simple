# Perplexity API Integration Installation Guide

This guide will walk you through the process of setting up the Perplexity API integration in your project.

## Prerequisites

- Node.js (version 18 or higher recommended)
- npm or yarn
- A Perplexity API key

## Step 1: Add the Perplexity API Key to Environment Variables

1. Create a `.env.local` file in the root of your frontend directory if it doesn't already exist.

2. Add your Perplexity API key to the file:
   ```
   PERPLEXITY_API_KEY=your_api_key_here
   ```

3. If you're using Doppler for environment management (as indicated in your package.json scripts), add the Perplexity API key to your Doppler configuration:
   ```bash
   doppler secrets set PERPLEXITY_API_KEY=your_api_key_here
   ```

## Step 2: Update the Environment Variables Example

1. Add the Perplexity API key to your `.env.example` file to document that it's required:
   ```
   # Add this line to your .env.example file
   PERPLEXITY_API_KEY=
   ```

## Step 3: Install Dependencies

The project already has all the necessary dependencies installed. The Perplexity API integration uses the native `fetch` API, which is available in modern Node.js versions and Next.js.

## Step 4: Verify the Installation

1. Start your development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Navigate to `/perplexity-demo` in your browser.

3. Select either "Regular Search" or "Deep Research" mode.

4. Enter a search query and click the "Search" button.

5. If everything is set up correctly, you should see a response from the Perplexity API.

## Available Models

The integration supports two Perplexity AI models:

1. **sonar** (Regular Search)
   - Used for quick, concise answers
   - Default model for general queries
   - Available at `/api/perplexity-search`

2. **sonar-deep-research** (Deep Research)
   - Features a 128k context window
   - Provides more comprehensive, well-researched answers
   - Includes related questions in the response
   - Available at `/api/perplexity-deep-research`

## Troubleshooting

### API Key Issues

If you see an error message like "Perplexity API key is not configured", check that:
- Your `.env.local` file contains the correct API key
- Your development server was restarted after adding the API key
- If using Doppler, ensure the API key is set in your Doppler configuration

### CORS Issues

If you encounter CORS errors, this is likely because the Perplexity API is being called directly from the browser. The current implementation calls the API from the server-side Next.js API route, which should avoid CORS issues.

### Rate Limiting

If you encounter rate limiting errors, you may need to implement rate limiting in your application or upgrade your Perplexity API plan.

### Model-Specific Issues

- **Deep Research Model**: This model may take longer to respond due to the more comprehensive research it performs. Ensure your request timeout settings are appropriate.

## Using the API in Other Parts of Your Application

### Regular Search

```javascript
const response = await fetch('/api/perplexity-search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: 'Your search query here' }),
});

const data = await response.json();
// Process the data
```

### Deep Research

```javascript
const response = await fetch('/api/perplexity-deep-research', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: 'Your detailed research query here' }),
});

const data = await response.json();
// Process the data
```

## Additional Configuration

You can customize the API parameters by modifying the route files:
- Regular search: `/api/perplexity-search/route.ts`
- Deep research: `/api/perplexity-deep-research/route.ts`

Refer to the [Perplexity API documentation](https://docs.perplexity.ai/) for more information on available parameters. 