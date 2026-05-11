import { db } from "@/db";
import { adolescentes } from "@/db/schema";
import { addDays, format, parseISO } from 'date-fns';
import { Trash2, PlusCircle, Calendar } from 'lucide-react';
import { addAdolescente, deleteAdolescente } from "./actions";

export default async function Dashboard() {
  const data = await db.select().from(adolescentes);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        {/* CABEÇALHO ESTILO OFICIAL */}
        <div className="bg-white p-6 rounded-t-xl border-b-4 border-green-600 shadow-sm text-center">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Estado do Maranhão</h2>
          <h1 className="text-xl font-black uppercase mt-1">Controle de Internação Provisória (45 Dias)</h1>
          <p className="text-sm text-gray-500 mt-2">{format(new Date(), "dd 'de' MMMM 'de' yyyy")}</p>
        </div>

        {/* FORMULÁRIO DE ADIÇÃO RÁPIDA */}
        <div className="bg-white p-4 border-b flex flex-wrap gap-4 items-end justify-center shadow-sm">
          <form action={addAdolescente} className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Nome do Adolescente</label>
              <input name="nome" required className="border p-2 rounded w-64 uppercase text-sm" placeholder="NOME COMPLETO" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Data Apreensão</label>
              <input name="dataApreensao" type="date" required className="border p-2 rounded text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Data Admissão</label>
              <input name="dataAdmissao" type="date" required className="border p-2 rounded text-sm" />
            </div>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 font-bold text-sm transition">
              <PlusCircle size={18} /> CADASTRAR
            </button>
          </form>
        </div>

        {/* TABELA DE CONTROLE */}
        <div className="bg-white shadow-xl rounded-b-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-white uppercase text-[11px] tracking-wider">
                <th className="p-4 text-center w-12">#</th>
                <th className="p-4 text-left">Nome</th>
                <th className="p-4 text-center">Apreensão</th>
                <th className="p-4 text-center">Admissão</th>
                <th className="p-4 text-center bg-amber-600">Prazo 45 Dias</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((item, index) => {
                // LÓGICA INTELIGENTE: Data de Apreensão + 44 dias
                const dataSaida = addDays(parseISO(item.dataApreensao), 44);
                const hoje = new Date();
                const estaPerto = addDays(hoje, 5) >= dataSaida; // Alerta se faltar 5 dias ou menos

                return (
                  <tr key={item.id} className={`hover:bg-gray-50 transition ${estaPerto ? 'bg-red-50' : ''}`}>
                    <td className="p-4 text-center font-mono text-gray-400">{index + 1}</td>
                    <td className="p-4 font-bold uppercase">{item.nome}</td>
                    <td className="p-4 text-center">{format(parseISO(item.dataApreensao), 'dd/MM/yyyy')}</td>
                    <td className="p-4 text-center">{format(parseISO(item.dataAdmissao), 'dd/MM/yyyy')}</td>
                    <td className={`p-4 text-center font-black ${estaPerto ? 'text-red-600' : 'text-amber-700'}`}>
                      {format(dataSaida, 'dd/MM/yyyy')}
                      {estaPerto && <span className="block text-[9px] animate-pulse">ALERTA DE PRAZO</span>}
                    </td>
                    <td className="p-4 text-center">
                      <form action={async () => { 'use server'; await deleteAdolescente(item.id); }}>
                        <button className="text-gray-300 hover:text-red-600 transition">
                          <Trash2 size={18} />
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="p-10 text-center text-gray-400 uppercase text-xs tracking-widest">
              Nenhum registro encontrado no sistema.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}