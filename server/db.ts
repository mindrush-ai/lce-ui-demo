import pg from 'pg'
const { Client } = pg
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import 'dotenv/config';


if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
(async () => {
  await client.connect();

})();

export const db = drizzle({ client, schema });