import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const adolescentes = sqliteTable("adolescentes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  dataApreensao: text("data_apreensao").notNull(), // ISO String
  dataAdmissao: text("data_admissao").notNull(),
});