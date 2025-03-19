import { defineConfig } from 'drizzle-kit'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be a Neon postgres connection string')
}

// Use environment variable with fallback
const PROJECT_NAME = process.env.PROJECT_NAME || 'unlabeled';

export default defineConfig({
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  schema: './src/app/db/schema.ts',
  schemaFilter: [PROJECT_NAME],
})