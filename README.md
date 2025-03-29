# ONE-TIME SETUP

1) Create required API keys and add to new Doppler project

    - Dopper project name "red-panda-simple"
    - Doppler secrets:
    - BRAINTRUST_API_KEY
    - DATABASE_URL (Neon)
    - FATHOM_API_KEY
    - ANTHROPIC_API_KEY
    - Any other LLM keys

 



# Create a new Red Panda project

```bash
bash -c 'cd ~/Documents/adder/"100 templates"/red-panda-simple && ./setup/red-panda-creator.sh'
```


# Update database

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

## Vercel Deployment

This template is pre-configured for Vercel deployment with the following settings:

- The `/frontend` directory is set as the root directory
- Next.js framework settings are pre-configured
- Build, development, and installation commands are pre-configured

During project setup, the configuration will be automatically detected and used.
