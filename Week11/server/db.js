import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
let db;

export async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db();
  console.log('[DB] Connected to MongoDB');
  return db;
}

export function getDB() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

process.on('SIGINT', async () => {
  await client.close();
  console.log('\n[DB] Connection closed');
  process.exit(0);
});