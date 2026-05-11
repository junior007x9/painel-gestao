import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const adolescentes = sqliteTable("adolescentes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  dataApreensao: text("data_apreensao").notNull(), 
  dataAdmissao: text("data_admissao").notNull(),   
  status: text("status").default("ativo"),         
  dataSaidaReal: text("data_saida_real"),          
  motivoSaida: text("motivo_saida"),               
  unidadeInternacao: text("unidade_internacao"),   // Novo
  dataInternacao: text("data_internacao"),         // Novo
  observacao: text("observacao"),                  // Novo
});