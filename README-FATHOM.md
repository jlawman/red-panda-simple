# Fathom Analytics Integration for Red Panda Projects

This integration allows you to automatically create a Fathom Analytics site for your Red Panda project and add the site ID to your Doppler environment variables.

## Prerequisites

- Fathom Analytics account with API access
- Doppler CLI installed
- Red Panda project template

## Scripts

### 1. fathom-setup.sh

A standalone script that creates a Fathom Analytics site and adds the site ID to Doppler.

**Usage:**
```bash
./fathom-setup.sh [project_name]
```

If no project name is provided, you will be prompted to enter one.

### 2. setup-red-panda-with-fathom.sh

A wrapper script that:
1. Copies the Fathom setup script to the Red Panda template directory
2. Runs the Red Panda creator script with Fathom integration

**Usage:**
```bash
./setup-red-panda-with-fathom.sh [project_name]
```

## Integration with Red Panda Creator

The integration adds the following environment variables to your Doppler project:

- `NEXT_PUBLIC_FATHOM_SITE_ID`: The Fathom site ID for client-side tracking
- `FATHOM_API_TOKEN`: Your Fathom API token for server-side operations

## Manual Integration

If you want to manually integrate Fathom with an existing Red Panda project:

1. Run the standalone Fathom setup script:
   ```bash
   ./fathom-setup.sh your-project-name
   ```

2. The script will:
   - Create a new Fathom site with your project name
   - Add the site ID and API token to your Doppler project

## Using Fathom in Your Next.js App

Once the integration is complete, you can use Fathom Analytics in your Next.js app:

1. Install the Fathom client:
   ```bash
   npm install fathom-client
   ```

2. Add Fathom tracking to your app:
   ```jsx
   // app/layout.tsx or pages/_app.tsx
   import { useEffect } from 'react'
   import { load, trackPageview } from 'fathom-client'
   
   export default function Layout({ children }) {
     useEffect(() => {
       if (process.env.NEXT_PUBLIC_FATHOM_SITE_ID) {
         load(process.env.NEXT_PUBLIC_FATHOM_SITE_ID, {
           includedDomains: ['yourdomain.com'],
         })
       }
       
       // Track page views
       const handleRouteChange = () => trackPageview()
       
       // Add event listeners for route changes
       // (implementation depends on your router)
       
       return () => {
         // Clean up event listeners
       }
     }, [])
     
     return <>{children}</>
   }
   ```

## Troubleshooting

- If you encounter issues with the Fathom API, check that your API token has the correct permissions.
- Make sure your Doppler CLI is properly configured.
- If the site ID is not being added to Doppler, check the output of the script for error messages. 