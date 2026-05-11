'use server'

import { db } from "@/db";
import { adolescentes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
  const obs = formData.get("observacao") as string; // Observação na saída

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