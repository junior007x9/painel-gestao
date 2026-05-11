export const dynamic = 'force-dynamic';

import { db } from "@/db";
import { adolescentes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { addDays, format, parseISO, isAfter, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, PlusCircle, History, Users, CheckCircle, RotateCcw, Printer } from 'lucide-react';
import { addAdolescente, deleteAdolescente, arquivarAdolescente, reativarAdolescente } from "./actions";

// Componente para o botão de imprimir que funciona no lado do cliente sem quebrar o build
const PrintButton = () => {
  return (
    <button 
      onClick={() => window.print()} 
      className="mt-4 no-print flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg mx-auto hover:bg-slate-700 transition text-sm font-bold shadow-lg"
    >
      <Printer size={18} /> EXPORTAR PDF / IMPRIMIR
    </button>
  );
};

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const params = await searchParams;
  const currentTab = params.tab || "ativos";

  const listaAtivos = await db.select().from(adolescentes).where(eq(adolescentes.status, 'ativo'));
  const listaHistorico = await db.select().from(adolescentes).where(eq(adolescentes.status, 'arquivado'));

  const dataExibicao = currentTab === "ativos" ? listaAtivos : listaHistorico;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="bg-white p-6 rounded-t-xl border-b-2 border-slate-200 shadow-sm text-center print:border-b-4 print:border-black print:shadow-none">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] print:text-black">Estado do Maranhão</h2>
          <h1 className="text-xl font-black uppercase mt-1 text-slate-800 print:text-black">Controle Socioeducativo - 45 Dias</h1>
          <p className="text-xs text-slate-500 mt-1 capitalize print:text-black">
            {format(new Date(), "eeee, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          
          <div className="no-print">
            <PrintButton />
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="bg-white border-b flex px-6 shadow-sm no-print">
          <a href="?tab=ativos" className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition ${currentTab === 'ativos' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            <Users size={18} /> ATIVOS ({listaAtivos.length})
          </a>
          <a href="?tab=historico" className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition ${currentTab === 'historico' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            <History size={18} /> HISTÓRICO ({listaHistorico.length})
          </a>
        </div>

        <div className="bg-white shadow-xl rounded-b-xl overflow-hidden print:shadow-none">
          
          {/* FORMULÁRIO DE CADASTRO */}
          {currentTab === "ativos" && (
            <div className="p-6 border-b bg-slate-50/50 no-print">
              <form action={addAdolescente} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Nome e Observação</label>
                  <input name="nome" required className="w-full border border-slate-300 p-2 rounded text-sm mb-2 uppercase" placeholder="NOME COMPLETO" />
                  <input name="observacao" className="w-full border border-slate-300 p-2 rounded text-xs outline-none" placeholder="Observações (Opcional)" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Apreensão</label>
                  <input name="dataApreensao" type="date" required className="w-full border border-slate-300 p-2 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Admissão</label>
                  <input name="dataAdmissao" type="date" required className="w-full border border-slate-300 p-2 rounded text-sm" />
                </div>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded text-sm transition shadow-md flex justify-center items-center gap-2">
                  <PlusCircle size={18} /> CADASTRAR
                </button>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold border-b print:bg-gray-200 print:text-black">
                  <th className="p-4 text-center w-12">#</th>
                  <th className="p-4 text-left">Nome / Obs</th>
                  <th className="p-4 text-center">Apreensão</th>
                  <th className="p-4 text-center">Admissão</th>
                  {currentTab === "ativos" ? (
                    <th className="p-4 text-center">Prazo 45 Dias</th>
                  ) : (
                    <th className="p-4 text-center">Desfecho / Unidade</th>
                  )}
                  <th className="p-4 text-center no-print">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataExibicao.map((item, index) => {
                  const dataSaidaPrevista = addDays(parseISO(item.dataApreensao), 44);
                  const hoje = new Date();
                  const isVencido = isAfter(hoje, dataSaidaPrevista);
                  const diasRestantes = differenceInDays(dataSaidaPrevista, hoje);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition group print:break-inside-avoid">
                      <td className="p-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                      <td className="p-4">
                        <div className="font-bold uppercase text-slate-700">{item.nome}</div>
                        {item.observacao && <div className="text-[10px] text-slate-400 italic">{item.observacao}</div>}
                      </td>
                      <td className="p-4 text-center">{format(parseISO(item.dataApreensao), 'dd/MM/yyyy')}</td>
                      <td className="p-4 text-center">{format(parseISO(item.dataAdmissao), 'dd/MM/yyyy')}</td>
                      
                      {currentTab === "ativos" ? (
                        <td className={`p-4 text-center font-black ${isVencido ? 'text-green-600 bg-green-50' : (diasRestantes <= 5 ? 'text-red-600 bg-red-50/50' : 'text-amber-700 bg-amber-50')}`}>
                          {format(dataSaidaPrevista, 'dd/MM/yyyy')}
                          {isVencido && <span className="block text-[9px] uppercase">Prazo Alcançado</span>}
                          {!isVencido && diasRestantes <= 5 && <span className="block text-[9px] animate-pulse uppercase">Faltam {diasRestantes} dias</span>}
                        </td>
                      ) : (
                        <td className="p-4 text-center">
                          <div className="font-bold text-blue-700 uppercase text-xs">{item.motivoSaida}</div>
                          {item.unidadeInternacao && (
                            <div className="text-[10px] text-slate-500 uppercase">
                              {item.unidadeInternacao} - {item.dataInternacao && format(parseISO(item.dataInternacao), 'dd/MM')}
                            </div>
                          )}
                        </td>
                      )}

                      <td className="p-4 text-center no-print">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition items-center">
                          {currentTab === "ativos" ? (
                            <form action={arquivarAdolescente} className="flex flex-col gap-1 items-center bg-slate-50 p-2 rounded border border-slate-200">
                              <input type="hidden" name="id" value={item.id} />
                              <select name="motivo" className="text-[10px] border rounded p-1 w-32 bg-white outline-none">
                                <option value="DESLIGADO">DESLIGADO</option>
                                <option value="INTERNAÇÃO">INTERNAÇÃO</option>
                              </select>
                              <input name="unidadeInternacao" placeholder="Unidade" className="text-[10px] border rounded p-1 w-32 uppercase" />
                              <input name="dataInternacao" type="date" className="text-[10px] border rounded p-1 w-32" />
                              <button className="text-green-600 flex items-center gap-1 font-bold text-[10px] uppercase hover:underline mt-1">
                                <CheckCircle size={14} /> Confirmar Baixa
                              </button>
                            </form>
                          ) : (
                            <form action={async () => { 'use server'; await reativarAdolescente(item.id); }}>
                              <button title="Reativar" className="text-orange-500 p-1 hover:bg-orange-50 rounded transition"><RotateCcw size={18} /></button>
                            </form>
                          )}
                          <form action={async () => { 'use server'; await deleteAdolescente(item.id); }}>
                            <button className="text-slate-300 hover:text-red-600 p-1 transition"><Trash2 size={18} /></button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CSS GLOBAL PARA IMPRESSÃO */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; padding: 0 !important; }
          table { border-collapse: collapse !important; width: 100% !important; }
          th, td { border: 1px solid #000 !important; color: black !important; padding: 8px !important; }
          tr { page-break-inside: avoid !important; }
        }
      `}} />
    </div>
  );
}