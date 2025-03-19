import { db } from './index'; // Adjust import path as needed
import { Users } from './schema';

async function seed() {
  console.log('Seeding database...');
  
  try {
    // Clear existing data (optional)
    // await db.delete(Users);
    
    // Insert sample users
    await db.insert(Users).values([
      {
        id: 'user123',
        userId: 'auth0|123456',
        email: 'john@example.com',
        name: 'John Doe',
      },
      {
        id: 'user456',
        userId: 'auth0|789012',
        email: 'jane@example.com',
        name: 'Jane Smith',
      },
      {
        id: 'user789',
        userId: 'auth0|345678',
        email: 'bob@example.com',
        name: 'Bob Johnson',
      },
    ]);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection if needed
    // await db.end();
  }
}

// Run the seed function
seed();