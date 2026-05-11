'use server'
import { db } from "@/db";
import { adolescentes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addAdolescente(formData: FormData) {
  const nome = formData.get("nome") as string;
  const apreensao = formData.get("dataApreensao") as string;
  const admissao = formData.get("dataAdmissao") as string;

  await db.insert(adolescentes).values({
    nome: nome.toUpperCase(),
    dataApreensao: apreensao,
    dataAdmissao: admissao,
  });

  revalidatePath("/");
}

export async function deleteAdolescente(id: number) {
  await db.delete(adolescentes).where(eq(adolescentes.id, id));
  revalidatePath("/");
}