# Coding Agent README


## Secrets
We use Doppler to store secrets. We have already preloaded the secrets for you.

## Auth
If auth is needed, we use Clerk. We like to keep it simple and have included sample code for you to use. We prefer to use clerk login button rather than create our own sign in/sign up pages.

## Analytics
We use Fathom to track events. We have already set it up for you.

## DB
We use Neon for the DB and have already set it up for you with a new project schema that is specific to this project. You shouldn't need to change any drizzle files except schema.ts. You can remove the existing table, but otherwise leave the schema export alone. This part here is what I'm talking about:

export const PROJECT_NAME = process.env.PROJECT_NAME || 'unlabeled';
export const projectSchema = pgSchema(PROJECT_NAME);

To push the schema to the DB, once you updated it, run:

doppler run -- npx drizzle-kit push


## Directory Structure
We're in a monorepo template and it is most likely that you will just need to make changes in the frontend folder. We sometimes build backend components, but for most projects on Next.js we just work in the frontend folder building all API routes and components.

## Misc
For Next.js we use 14 and the app router.



