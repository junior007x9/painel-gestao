export const dynamic = 'force-dynamic';

import { db } from "@/db";
import { adolescentes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { addDays, format, parseISO, isAfter, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, PlusCircle, History, Users, CheckCircle, RotateCcw, Info } from 'lucide-react';
import { addAdolescente, deleteAdolescente, arquivarAdolescente, reativarAdolescente } from "./actions";
import PrintButton from "./PrintButton";

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
              <form action={addAdolescente} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Nome do Adolescente</label>
                  <input name="nome" required className="w-full border border-slate-300 p-2 rounded text-sm uppercase outline-none" placeholder="NOME COMPLETO" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Apreensão</label>
                  <input name="dataApreensao" type="date" required className="w-full border border-slate-300 p-2 rounded text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Admissão</label>
                  <input name="dataAdmissao" type="date" required className="w-full border border-slate-300 p-2 rounded text-sm outline-none" />
                </div>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded text-sm transition shadow-md flex justify-center items-center gap-2">
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
                  <th className="p-4 text-left">Nome do Adolescente</th>
                  <th className="p-4 text-center">Apreensão</th>
                  <th className="p-4 text-center">Admissão</th>
                  {currentTab === "ativos" ? (
                    <th className="p-4 text-center">Prazo 45 Dias</th>
                  ) : (
                    <th className="p-4 text-center">Desfecho / Obs</th>
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

                  // Nova lógica de cores: Verde para prazo cumprido, Vermelho para urgência
                  const corCélula = isVencido 
                    ? 'text-green-600 bg-green-50' // VERDE: Período concluído ✅
                    : (diasRestantes <= 5 
                        ? 'text-red-600 bg-red-50/50 animate-pulse' // VERMELHO: Alerta de Urgência 🚨
                        : 'text-amber-700 bg-amber-50'); // ÂMBAR: Prazo normal

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition group print:break-inside-avoid">
                      <td className="p-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                      <td className="p-4 font-bold uppercase text-slate-700">{item.nome}</td>
                      <td className="p-4 text-center">{format(parseISO(item.dataApreensao), 'dd/MM/yyyy')}</td>
                      <td className="p-4 text-center">{format(parseISO(item.dataAdmissao), 'dd/MM/yyyy')}</td>
                      
                      {currentTab === "ativos" ? (
                        <td className={`p-4 text-center font-black ${corCélula}`}>
                          {format(dataSaidaPrevista, 'dd/MM/yyyy')}
                          {isVencido ? (
                             <span className="block text-[9px] uppercase font-bold text-green-700">Prazo Alcançado ✅</span>
                          ) : (
                            diasRestantes <= 5 && <span className="block text-[9px] uppercase">Faltam {diasRestantes} dias</span>
                          )}
                        </td>
                      ) : (
                        <td className="p-4 text-center">
                          <div className="font-bold text-blue-700 uppercase text-xs">{item.motivoSaida}</div>
                          {item.unidadeInternacao && <div className="text-[10px] text-slate-500 uppercase">Unidade: {item.unidadeInternacao}</div>}
                          {item.observacao && <div className="text-[10px] text-slate-400 italic">Obs: {item.observacao}</div>}
                        </td>
                      )}

                      <td className="p-4 text-center no-print">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition items-center">
                          {currentTab === "ativos" ? (
                            <form action={arquivarAdolescente} className="flex flex-col gap-1 items-center bg-slate-50 p-2 rounded border border-slate-200">
                              <input type="hidden" name="id" value={item.id} />
                              <select name="motivo" className="text-[10px] border rounded p-1 w-36 bg-white outline-none cursor-pointer">
                                <option value="DESLIGADO">DESLIGADO</option>
                                <option value="INTERNAÇÃO">INTERNAÇÃO</option>
                              </select>
                              <input name="unidadeInternacao" placeholder="Unidade (se houver)" className="text-[10px] border rounded p-1 w-36 uppercase outline-none" />
                              <input name="observacao" placeholder="Observações de saída" className="text-[10px] border rounded p-1 w-36 outline-none" />
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

        {/* RODAPÉ INFORMATIVO E LEGENDA (Escondidos na impressão) */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100 no-print">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-tighter">
                Sistema de Gestão v1.3 • Timon-MA
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Este controle segue o cálculo inteligente de 45 dias corridos.</p>
            </div>
            
            {/* LEGENDA DE CORES SOLICITADA */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase text-slate-600 flex items-center gap-2">
                <Info size={14} /> Legenda de Cores (Status do Prazo)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-50 rounded border border-green-200 flex items-center justify-center">
                    <span className="text-green-700 font-black text-xs">A</span>
                  </div>
                  <span className="text-[10px] font-bold text-green-800 uppercase">Prazo Alcançado ✅</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-50/50 rounded border border-red-200 flex items-center justify-center animate-pulse">
                    <span className="text-red-700 font-black text-xs">U</span>
                  </div>
                  <span className="text-[10px] font-bold text-red-800 uppercase">Urgência (≤ 5 dias) 🚨</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-amber-50 rounded border border-amber-200 flex items-center justify-center">
                    <span className="text-amber-700 font-black text-xs">P</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Prazo Normal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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