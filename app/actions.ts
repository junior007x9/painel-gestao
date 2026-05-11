'use server'

import { db } from "@/db";
import { adolescentes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Adiciona um novo adolescente ao sistema
 */
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

/**
 * Remove permanentemente um registro (Cuidado!)
 */
export async function deleteAdolescente(id: number) {
  await db.delete(adolescentes).where(eq(adolescentes.id, id));
  revalidatePath("/");
}

/**
 * Move o adolescente para o histórico (Arquivamento)
 * É disparado quando se clica em "Dar Baixa"
 */
export async function arquivarAdolescente(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const motivo = formData.get("motivo") as string || "Prazo Encerrado";

  await db.update(adolescentes)
    .set({ 
      status: 'arquivado', 
      dataSaidaReal: new Date().toISOString(),
      motivoSaida: motivo 
    })
    .where(eq(adolescentes.id, id));
  
  revalidatePath("/");
}

/**
 * Opcional: Reativar um adolescente do histórico se necessário
 */
export async function reativarAdolescente(id: number) {
  await db.update(adolescentes)
    .set({ 
      status: 'ativo',
      dataSaidaReal: null,
      motivoSaida: null 
    })
    .where(eq(adolescentes.id, id));
  
  revalidatePath("/");
}