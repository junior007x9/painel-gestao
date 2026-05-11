import { db } from "@/db";
import { adolescentes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { addDays, format, parseISO, isAfter, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, PlusCircle, History, Users, CheckCircle, RotateCcw } from 'lucide-react';
import { addAdolescente, deleteAdolescente, arquivarAdolescente, reativarAdolescente } from "./actions";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const currentTab = searchParams.tab || "ativos";

  // Busca dados do Turso baseados na aba selecionada
  const listaAtivos = await db.select().from(adolescentes).where(eq(adolescentes.status, 'ativo'));
  const listaHistorico = await db.select().from(adolescentes).where(eq(adolescentes.status, 'arquivado'));

  const dataExibicao = currentTab === "ativos" ? listaAtivos : listaHistorico;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* CABEÇALHO ESTILO OFICIAL */}
        <div className="bg-white p-6 rounded-t-xl border-b-2 border-slate-200 shadow-sm text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Users size={24} />
            </div>
          </div>
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Estado do Maranhão</h2>
          <h1 className="text-xl font-black uppercase mt-1 text-slate-800">Controle Socioeducativo - 45 Dias</h1>
          <p className="text-xs text-slate-500 mt-1 capitalize">
            {format(new Date(), "eeee, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="bg-white border-b flex px-6 shadow-sm">
          <a 
            href="?tab=ativos" 
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition ${currentTab === 'ativos' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Users size={18} /> ATIVOS ({listaAtivos.length})
          </a>
          <a 
            href="?tab=historico" 
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition ${currentTab === 'historico' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <History size={18} /> HISTÓRICO ({listaHistorico.length})
          </a>
        </div>

        {/* ÁREA DE CONTEÚDO */}
        <div className="bg-white shadow-xl rounded-b-xl overflow-hidden">
          
          {currentTab === "ativos" && (
            <div className="p-6 border-b bg-slate-50/50">
              <h3 className="text-xs font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
                <PlusCircle size={14} /> Novo Cadastro
              </h3>
              <form action={addAdolescente} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Nome Completo</label>
                  <input name="nome" required className="w-full border border-slate-300 p-2 rounded text-sm focus:ring-2 ring-green-500 outline-none uppercase" placeholder="NOME DO ADOLESCENTE" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Data Apreensão</label>
                  <input name="dataApreensao" type="date" required className="w-full border border-slate-300 p-2 rounded text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Data Admissão</label>
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
                <tr className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b">
                  <th className="p-4 text-center w-12">#</th>
                  <th className="p-4 text-left">Nome do Adolescente</th>
                  <th className="p-4 text-center">Apreensão</th>
                  <th className="p-4 text-center">Admissão</th>
                  {currentTab === "ativos" ? (
                    <th className="p-4 text-center bg-amber-50 text-amber-700 font-black">Previsão 45 Dias</th>
                  ) : (
                    <>
                      <th className="p-4 text-center">Saída Real</th>
                      <th className="p-4 text-center">Motivo</th>
                    </>
                  )}
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataExibicao.map((item, index) => {
                  const dataSaidaPrevista = addDays(parseISO(item.dataApreensao), 44);
                  const hoje = new Date();
                  const diasRestantes = differenceInDays(dataSaidaPrevista, hoje);
                  const isExpirado = isAfter(hoje, dataSaidaPrevista);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition group">
                      <td className="p-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                      <td className="p-4 font-bold uppercase text-slate-700">{item.nome}</td>
                      <td className="p-4 text-center text-slate-600">{format(parseISO(item.dataApreensao), 'dd/MM/yyyy')}</td>
                      <td className="p-4 text-center text-slate-600">{format(parseISO(item.dataAdmissao), 'dd/MM/yyyy')}</td>
                      
                      {currentTab === "ativos" ? (
                        <td className={`p-4 text-center font-black ${isExpirado || diasRestantes <= 5 ? 'text-red-600 bg-red-50/50' : 'text-amber-700 bg-amber-50/30'}`}>
                          {format(dataSaidaPrevista, 'dd/MM/yyyy')}
                          {diasRestantes <= 5 && !isExpirado && (
                            <span className="block text-[9px] font-bold animate-pulse uppercase">Faltam {diasRestantes} dias</span>
                          )}
                          {isExpirado && (
                            <span className="block text-[9px] font-bold bg-red-600 text-white px-1 rounded uppercase">Prazo Vencido</span>
                          )}
                        </td>
                      ) : (
                        <>
                          <td className="p-4 text-center text-blue-700 font-bold">
                            {item.dataSaidaReal ? format(parseISO(item.dataSaidaReal), 'dd/MM/yyyy') : '-'}
                          </td>
                          <td className="p-4 text-center italic text-slate-500">{item.motivoSaida}</td>
                        </>
                      )}

                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                          {currentTab === "ativos" ? (
                            <form action={arquivarAdolescente} className="flex gap-1">
                              <input type="hidden" name="id" value={item.id} />
                              <select name="motivo" className="text-[10px] border rounded bg-white outline-none p-1">
                                <option value="Prazo Encerrado">Prazo Encerrado</option>
                                <option value="Alvará de Soltura">Alvará de Soltura</option>
                                <option value="Transferência">Transferência</option>
                              </select>
                              <button title="Dar Baixa" className="text-green-600 hover:bg-green-50 p-1 rounded border border-green-200 shadow-sm">
                                <CheckCircle size={18} />
                              </button>
                            </form>
                          ) : (
                            <form action={async () => { 'use server'; await reativarAdolescente(item.id); }}>
                              <button title="Reativar" className="text-orange-500 hover:bg-orange-50 p-1 rounded border border-orange-200">
                                <RotateCcw size={18} />
                              </button>
                            </form>
                          )}
                          <form action={async () => { 'use server'; await deleteAdolescente(item.id); }}>
                            <button title="Excluir Permanentemente" className="text-slate-300 hover:text-red-600 p-1 transition">
                              <Trash2 size={18} />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {dataExibicao.length === 0 && (
              <div className="flex flex-col items-center justify-center p-20 text-slate-300">
                <Users size={48} className="mb-2 opacity-20" />
                <p className="uppercase text-[10px] font-bold tracking-widest">Nenhum registro nesta categoria</p>
              </div>
            )}
          </div>
        </div>

        {/* RODAPÉ INFORMATIVO */}
        <div className="mt-6 flex justify-between items-center px-2">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
            Sistema de Gestão v1.2 • Timon-MA
          </p>
          <div className="flex gap-4">
             <div className="flex items-center gap-1">
               <div className="w-3 h-3 bg-red-500 rounded-full"></div>
               <span className="text-[9px] font-bold text-slate-500 uppercase">Urgente</span>
             </div>
             <div className="flex items-center gap-1">
               <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
               <span className="text-[9px] font-bold text-slate-500 uppercase">Atenção</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}