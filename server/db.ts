import pg from 'pg'
const { Client } = pg
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import 'dotenv/config';

// Only initialize database if DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL not set - using mock storage for testing");
}

let db: any = null;

if (process.env.DATABASE_URL) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  (async () => {
    await client.connect();
  })();
  
  db = drizzle({ client, schema });
}

export { db };