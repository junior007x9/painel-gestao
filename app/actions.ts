'use server'

import { db } from "@/db";
import { adolescentes, relatorios, audiencias, controleInternacao } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Tipo auxiliar para reordenação de itens na tabela (Drag & Drop)
export type ItemOrdenado = { id: number; ordem: number };

// ==========================================
// --- MÓDULO: FASE (45 DIAS)
// ==========================================

export async function addAdolescente(formData: FormData) {
  const nome = formData.get("nome") as string;
  const apreensao = formData.get("dataApreensao") as string;
  const admissao = formData.get("dataAdmissao") as string;

  if (!nome || !apreensao || !admissao) return;

  await db.insert(adolescentes).values({
    nome: nome.toUpperCase(),
    dataApreensao: apreensao,
    dataAdmissao: admissao,
    status: 'ativo',
  });

  revalidatePath("/");
}

// NOVA FUNÇÃO: Editar Adolescente
export async function editAdolescente(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  await db.update(adolescentes).set({
    nome: (formData.get("nome") as string).toUpperCase(),
    dataApreensao: formData.get("dataApreensao") as string,
    dataAdmissao: formData.get("dataAdmissao") as string,
  }).where(eq(adolescentes.id, id));
  
  revalidatePath("/");
}

export async function deleteAdolescente(id: number) {
  await db.delete(adolescentes).where(eq(adolescentes.id, id));
  revalidatePath("/");
}

export async function arquivarAdolescente(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const motivo = formData.get("motivo") as string;
  const obs = formData.get("observacao") as string;

  await db.update(adolescentes)
    .set({ 
      status: 'arquivado', 
      dataSaidaReal: new Date().toISOString(),
      motivoSaida: motivo,
      observacao: obs || null
    })
    .where(eq(adolescentes.id, id));
  
  revalidatePath("/");
}

export async function reativarAdolescente(id: number) {
  await db.update(adolescentes)
    .set({ 
      status: 'ativo',
      dataSaidaReal: null,
      motivoSaida: null,
      unidadeInternacao: null,
      dataInternacao: null,
      observacao: null
    })
    .where(eq(adolescentes.id, id));
  
  revalidatePath("/");
}

// ==========================================
// --- MÓDULO: CONTROLE DE INTERNAÇÃO GERAL
// ==========================================

export async function addControleInternacao(formData: FormData) {
  const nome = formData.get("nome") as string;
  const admissao = formData.get("dataAdmissao") as string;
  const comarca = formData.get("comarca") as string;
  const tipo = formData.get("tipo") as string;

  if (!nome || !admissao || !comarca || !tipo) return;

  await db.insert(controleInternacao).values({
    nome: nome.toUpperCase(),
    dataAdmissao: admissao,
    comarca: comarca.toUpperCase(),
    tipo: tipo,
    status: 'ativo'
  });

  revalidatePath("/");
}

export async function editControleInternacao(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  await db.update(controleInternacao).set({
    nome: (formData.get("nome") as string).toUpperCase(),
    dataAdmissao: formData.get("dataAdmissao") as string,
    comarca: (formData.get("comarca") as string).toUpperCase(),
    tipo: formData.get("tipo") as string,
  }).where(eq(controleInternacao.id, id));
  
  revalidatePath("/");
}

export async function arquivarControleInternacao(id: number) {
  await db.update(controleInternacao).set({ status: 'arquivado' }).where(eq(controleInternacao.id, id));
  revalidatePath("/");
}

export async function reativarControleInternacao(id: number) {
  await db.update(controleInternacao).set({ status: 'ativo' }).where(eq(controleInternacao.id, id));
  revalidatePath("/");
}

// ==========================================
// --- MÓDULO: RELATÓRIOS
// ==========================================

export async function addRelatorio(formData: FormData) {
  const nome = formData.get("nome") as string;
  const processo = formData.get("processo") as string;
  const entrega = formData.get("dataEntrega") as string;

  if (!nome || !processo || !entrega) return;

  await db.insert(relatorios).values({
    nome: nome.toUpperCase(),
    nProcesso: processo,
    dataEntrega: entrega,
    status: 'ativo'
  });

  revalidatePath("/");
}

export async function editRelatorio(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  await db.update(relatorios).set({
    nome: (formData.get("nome") as string).toUpperCase(),
    nProcesso: formData.get("processo") as string,
    dataEntrega: formData.get("dataEntrega") as string,
  }).where(eq(relatorios.id, id));
  
  revalidatePath("/");
}

export async function arquivarRelatorio(id: number) {
  await db.update(relatorios).set({ status: 'arquivado' }).where(eq(relatorios.id, id));
  revalidatePath("/");
}

export async function reativarRelatorio(id: number) {
  await db.update(relatorios).set({ status: 'ativo' }).where(eq(relatorios.id, id));
  revalidatePath("/");
}

export async function deleteRelatorio(id: number) {
  await db.delete(relatorios).where(eq(relatorios.id, id));
  revalidatePath("/");
}

export async function marcarComoEntregue(id: number) {
  await arquivarRelatorio(id); 
}

// NOVA FUNÇÃO: Atualizar ordem dos relatórios arrastados
export async function atualizarOrdemRelatorios(itens: ItemOrdenado[]) {
  try {
    for (const item of itens) {
      await db.update(relatorios).set({ ordem: item.ordem }).where(eq(relatorios.id, item.id));
    }
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao reordenar relatórios:", error);
    return { success: false };
  }
}

// ==========================================
// --- MÓDULO: AUDIÊNCIAS
// ==========================================

export async function addAudiencia(formData: FormData) {
  const nomesArray = formData.getAll("nomes") as string[];
  const data = formData.get("data") as string;
  const hora = formData.get("hora") as string;
  const processo = formData.get("processo") as string;

  if (!data || !hora || !processo) return;

  const nomesFormatados = nomesArray
    .filter(n => n.trim() !== "")
    .map(n => n.toUpperCase())
    .join(", ");

  await db.insert(audiencias).values({
    nomes: nomesFormatados,
    data: data,
    hora: hora,
    nProcesso: processo,
    status: 'ativo'
  });

  revalidatePath("/");
}

export async function editAudiencia(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const nomesArray = formData.getAll("nomes") as string[];
  
  const nomesFormatados = nomesArray
    .filter(n => n.trim() !== "")
    .map(n => n.toUpperCase())
    .join(", ");
    
  await db.update(audiencias).set({
    nomes: nomesFormatados,
    data: formData.get("data") as string,
    hora: formData.get("hora") as string,
    nProcesso: formData.get("processo") as string,
  }).where(eq(audiencias.id, id));
  
  revalidatePath("/");
}

export async function arquivarAudiencia(id: number) {
  await db.update(audiencias).set({ status: 'arquivado' }).where(eq(audiencias.id, id));
  revalidatePath("/");
}

export async function reativarAudiencia(id: number) {
  await db.update(audiencias).set({ status: 'ativo' }).where(eq(audiencias.id, id));
  revalidatePath("/");
}

export async function deleteAudiencia(id: number) {
  await db.delete(audiencias).where(eq(audiencias.id, id));
  revalidatePath("/");
}

// NOVA FUNÇÃO: Atualizar ordem das audiências arrastadas
export async function atualizarOrdemAudiencias(itens: ItemOrdenado[]) {
  try {
    for (const item of itens) {
      await db.update(audiencias).set({ ordem: item.ordem }).where(eq(audiencias.id, item.id));
    }
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao reordenar audiências:", error);
    return { success: false };
  }
}

// ==========================================
// --- FUNÇÃO DE DELEÇÃO GLOBAL (HISTÓRICO)
// ==========================================

export async function deleteGeneral(id: number, table: 'ado' | 'rel' | 'aud' | 'ctrl') {
  if (table === 'ado') await db.delete(adolescentes).where(eq(adolescentes.id, id));
  if (table === 'rel') await db.delete(relatorios).where(eq(relatorios.id, id));
  if (table === 'aud') await db.delete(audiencias).where(eq(audiencias.id, id));
  if (table === 'ctrl') await db.delete(controleInternacao).where(eq(controleInternacao.id, id));
  revalidatePath("/");
}