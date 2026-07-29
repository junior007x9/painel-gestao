import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const adolescentes = sqliteTable("adolescentes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  dataApreensao: text("data_apreensao").notNull(), 
  dataAdmissao: text("data_admissao").notNull(),   
  status: text("status").default("ativo"),         
  dataSaidaReal: text("data_saida_real"),          
  motivoSaida: text("motivo_saida"),               
  unidadeInternacao: text("unidade_internacao"),   
  dataInternacao: text("data_internacao"),         
  observacao: text("observacao"),                  
});

export const relatorios = sqliteTable("relatorios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  nProcesso: text("n_processo").notNull(),
  dataEntrega: text("data_entrega").notNull(),
  status: text("status").default("ativo"),
  ordem: integer("ordem").default(0).notNull(), // <-- NOVA COLUNA
});

export const audiencias = sqliteTable("audiencias", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nomes: text("nomes").notNull(),
  data: text("data").notNull(),
  hora: text("hora").notNull(),
  nProcesso: text("n_processo").notNull(),
  status: text("status").default("ativo"),
  ordem: integer("ordem").default(0).notNull(), // <-- NOVA COLUNA
});

// NOVO: Módulo Controle de Internação
export const controleInternacao = sqliteTable("controle_internacao", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  dataAdmissao: text("data_admissao").notNull(),
  comarca: text("comarca").notNull(),
  tipo: text("tipo").notNull(), // 'Internação Provisória' ou 'Atendimento Inicial'
  status: text("status").default("ativo"),
});