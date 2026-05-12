'use server'

import { db } from "@/db";
import { adolescentes, relatorios, audiencias } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- AÇÕES DO MÓDULO 45 DIAS ---

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

export async function deleteAdolescente(id: number) {
  await db.delete(adolescentes).where(eq(adolescentes.id, id));
  revalidatePath("/");
}

export async function arquivarAdolescente(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const motivo = formData.get("motivo") as string;
  const unidade = formData.get("unidadeInternacao") as string;
  const dataInt = formData.get("dataInternacao") as string;
  const obs = formData.get("observacao") as string;

  await db.update(adolescentes)
    .set({ 
      status: 'arquivado', 
      dataSaidaReal: new Date().toISOString(),
      motivoSaida: motivo,
      unidadeInternacao: unidade || null,
      dataInternacao: dataInt || null,
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

// --- AÇÕES DO MÓDULO RELATÓRIOS ---

export async function addRelatorio(formData: FormData) {
  const nome = formData.get("nome") as string;
  const processo = formData.get("processo") as string;
  const entrega = formData.get("dataEntrega") as string;

  if (!nome || !processo || !entrega) return;

  await db.insert(relatorios).values({
    nome: nome.toUpperCase(),
    nProcesso: processo,
    dataEntrega: entrega,
    status: 'pendente'
  });

  revalidatePath("/");
}

export async function marcarComoEntregue(id: number) {
  await db.update(relatorios)
    .set({ status: 'entregue' })
    .where(eq(relatorios.id, id));
  
  revalidatePath("/");
}

export async function deleteRelatorio(id: number) {
  await db.delete(relatorios).where(eq(relatorios.id, id));
  revalidatePath("/");
}

// --- AÇÕES DO NOVO MÓDULO AUDIÊNCIAS ---

export async function addAudiencia(formData: FormData) {
  // formData.getAll pega todos os campos com o nome 'nomes' (os vários adolescentes)
  const nomesArray = formData.getAll("nomes") as string[];
  const data = formData.get("data") as string;
  const hora = formData.get("hora") as string;
  const processo = formData.get("processo") as string;

  if (!data || !hora || !processo) return;

  // Filtra nomes vazios, coloca em maiúsculas e junta em uma string com vírgula
  const nomesFormatados = nomesArray
    .filter(n => n.trim() !== "")
    .map(n => n.toUpperCase())
    .join(", ");

  await db.insert(audiencias).values({
    nomes: nomesFormatados,
    data: data,
    hora: hora,
    nProcesso: processo,
    status: 'agendada'
  });

  revalidatePath("/");
}

export async function deleteAudiencia(id: number) {
  await db.delete(audiencias).where(eq(audiencias.id, id));
  revalidatePath("/");
}