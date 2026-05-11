import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const adolescentes = sqliteTable("adolescentes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  dataApreensao: text("data_apreensao").notNull(), // Formato ISO YYYY-MM-DD
  dataAdmissao: text("data_admissao").notNull(),   // Formato ISO YYYY-MM-DD
  status: text("status").default("ativo"),         // 'ativo' ou 'arquivado'
  dataSaidaReal: text("data_saida_real"),          // Registra quando saiu do sistema
  motivoSaida: text("motivo_saida"),               // Ex: Prazo Expirado, Alvará, etc.
});