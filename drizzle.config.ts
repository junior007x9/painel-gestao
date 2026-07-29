import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Força o Drizzle a ler o arquivo .env.local
config({ path: '.env.local' }); 

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'turso', // Especifica que estamos usando Turso/LibSQL
  dbCredentials: {
    url: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || '',
    authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || '',
  },
});