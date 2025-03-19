//To update the db run:
//npx drizzle-kit push

//To review tables run:
//npx drizzle-kit studio

import { text, timestamp, pgSchema } from 'drizzle-orm/pg-core'

// Use environment variable with fallback
export const PROJECT_NAME = process.env.PROJECT_NAME || 'unlabeled';
export const projectSchema = pgSchema(PROJECT_NAME);

// These table names can be anything since the schema is specific to this project (schema acts like a folder in Neon)
export const PurchaseOrders = projectSchema.table('purchase_orders', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull(),
  email: text('email'),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
