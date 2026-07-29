import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Carrega as variáveis de ambiente do seu arquivo .env, se houver
dotenv.config(); 

export default defineConfig({
  schema: './db/schema.ts', // Caminho onde estão as suas tabelas
  out: './drizzle',         // Pasta onde ele vai guardar o histórico de migrações
  dialect: 'sqlite',        // Avisa que estamos usando SQLite
  dbCredentials: {
    // Aqui ele vai tentar pegar a URL do banco do seu .env. 
    // Se não tiver, ele cria/usa um arquivo local chamado 'sqlite.db'
    url: process.env.DATABASE_URL || 'file:./sqlite.db', 
  },
});