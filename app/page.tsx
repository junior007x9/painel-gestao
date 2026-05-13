export const dynamic = 'force-dynamic';

import { db } from "@/db";
import { adolescentes, relatorios, audiencias, controleInternacao } from "@/db/schema";
import { eq } from "drizzle-orm";
import { addDays, format, parseISO, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, History, Users, CheckCircle, RotateCcw, Info, FileText, Calendar, Building } from 'lucide-react';
import { 
  addAdolescente, arquivarAdolescente, reativarAdolescente, 
  addRelatorio, arquivarRelatorio, reativarRelatorio,
  arquivarAudiencia, reativarAudiencia, 
  addControleInternacao, arquivarControleInternacao, reativarControleInternacao,
  deleteGeneral 
} from "./actions";
import PrintButton from "./PrintButton";
import AudienciaForm from "./AudienciaForm";

export default async function Dashboard({ searchParams }: { searchParams: { mod?: string, tab?: string } }) {
  const params = await searchParams;
  const currentMod = params.mod || "internacao";
  const currentTab = params.tab || "ativos";

  // Busca de Dados Integrada
  const ativosAdo = await db.select().from(adolescentes).where(eq(adolescentes.status, 'ativo'));
  const histAdo = await db.select().from(adolescentes).where(eq(adolescentes.status, 'arquivado'));
  
  const ativosRel = await db.select().from(relatorios).where(eq(relatorios.status, 'ativo'));
  const histRel = await db.select().from(relatorios).where(eq(relatorios.status, 'arquivado'));

  const ativosAud = await db.select().from(audiencias).where(eq(audiencias.status, 'ativo'));
  const histAud = await db.select().from(audiencias).where(eq(audiencias.status, 'arquivado'));

  const ativosCtrl = await db.select().from(controleInternacao).where(eq(controleInternacao.status, 'ativo'));
  const histCtrl = await db.select().from(controleInternacao).where(eq(controleInternacao.status, 'arquivado'));

  // Define as cores dinâmicas baseadas no módulo selecionado
  let colorTheme = { border: 'border-slate-200', btn: 'border-slate-600 text-slate-700 bg-slate-50' };
  if (currentMod === 'internacao') colorTheme = { border: 'border-green-600', btn: 'border-green-600 text-green-700 bg-green-50' };
  if (currentMod === 'relatorios') colorTheme = { border: 'border-indigo-600', btn: 'border-indigo-600 text-indigo-700 bg-indigo-50' };
  if (currentMod === 'audiencias') colorTheme = { border: 'border-emerald-600', btn: 'border-emerald-600 text-emerald-700 bg-emerald-50' };
  if (currentMod === 'controle_internacao') colorTheme = { border: 'border-blue-600', btn: 'border-blue-600 text-blue-700 bg-blue-50' };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto print:max-w-none">
        
        {/* SELETOR DE MÓDULO */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 no-print">
          <a href="?mod=internacao" className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition shadow-sm ${currentMod === 'internacao' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
            <Users size={18} /> FASE (45 DIAS)
          </a>
          <a href="?mod=controle_internacao" className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition shadow-sm ${currentMod === 'controle_internacao' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
            <Building size={18} /> CONTROLE INTERNAÇÃO
          </a>
          <a href="?mod=relatorios" className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition shadow-sm ${currentMod === 'relatorios' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
            <FileText size={18} /> RELATÓRIOS
          </a>
          <a href="?mod=audiencias" className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition shadow-sm ${currentMod === 'audiencias' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
            <Calendar size={18} /> AUDIÊNCIAS
          </a>
        </div>

        {/* CABEÇALHO GERAL E ABAS */}
        <div className={`bg-white rounded-t-xl border-b-2 shadow-sm text-center print:border-b-4 print:border-black print:shadow-none overflow-hidden ${colorTheme.border}`}>
          <div className="p-6">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] print:text-black print:text-xs">Estado do Maranhão • Timon</h2>
            <h1 className="text-xl font-black uppercase mt-1 text-slate-800 print:text-black print:text-2xl">
              {currentMod === 'internacao' && "FASE FUNDAÇÃO DO ATENDIMENTO SOCIOEDUCATIVO"}
              {currentMod === 'controle_internacao' && "Controle de Internação e Atendimento Inicial"}
              {currentMod === 'relatorios' && "Relatórios de Acompanhamento"}
              {currentMod === 'audiencias' && "Controle de Audiências Judiciais"}
            </h1>
            <p className="text-xs text-slate-500 mt-1 capitalize print:text-black print:text-sm">
              {format(new Date(), "eeee, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <div className="no-print mt-2">
              <PrintButton />
            </div>
          </div>
          
          <div className="flex justify-center bg-slate-50 border-t no-print">
            <a href={`?mod=${currentMod}&tab=ativos`} className={`px-8 py-3 text-xs font-black uppercase transition border-b-2 ${currentTab === 'ativos' ? colorTheme.btn : 'border-transparent text-slate-400 hover:bg-slate-100'}`}>
              Em Andamento
            </a>
            <a href={`?mod=${currentMod}&tab=historico`} className={`px-8 py-3 text-xs font-black uppercase transition border-b-2 ${currentTab === 'historico' ? colorTheme.btn : 'border-transparent text-slate-400 hover:bg-slate-100'}`}>
              Histórico / Concluídos
            </a>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MÓDULO 1: FASE (45 DIAS) */}
        {/* ========================================================= */}
        {currentMod === 'internacao' && (
          <div className="bg-white shadow-xl rounded-b-xl overflow-hidden print:shadow-none print:rounded-none">
            {currentTab === "ativos" && (
              <div className="p-6 border-b bg-slate-50/50 no-print">
                <form action={addAdolescente} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <input name="nome" required className="border p-2 rounded text-sm uppercase outline-none" placeholder="NOME DO ADOLESCENTE" />
                  <input name="dataApreensao" type="date" required className="border p-2 rounded text-sm outline-none" title="Data da Apreensão" />
                  <input name="dataAdmissao" type="date" required className="border p-2 rounded text-sm outline-none" title="Data de Admissão na Unidade" />
                  <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded text-sm shadow-md transition uppercase">Cadastrar</button>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold border-b print:bg-gray-200">
                    <th className="p-4 w-12">#</th>
                    <th className="p-4 text-left">Nome Completo</th>
                    <th className="p-4 text-center">Apreensão</th>
                    <th className="p-4 text-center">Admissão Unidade</th>
                    {currentTab === "ativos" ? <th className="p-4 text-center text-green-700">Prazo 45 Dias</th> : <th className="p-4 text-center">Desfecho / Obs</th>}
                    <th className="p-4 text-center no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(currentTab === 'ativos' ? ativosAdo : histAdo).map((item, index) => {
                    const dataSaida = addDays(parseISO(item.dataApreensao), 44);
                    const isVencido = isAfter(new Date(), dataSaida);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition group print:break-inside-avoid">
                        <td className="p-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                        <td className="p-4 font-bold uppercase print:text-black print:text-base">{item.nome}</td>
                        <td className="p-4 text-center print:text-black print:text-base">{format(parseISO(item.dataApreensao), 'dd/MM/yyyy')}</td>
                        <td className="p-4 text-center print:text-black print:text-base">{format(parseISO(item.dataAdmissao), 'dd/MM/yyyy')}</td>
                        {currentTab === "ativos" ? (
                          <td className="p-4 text-center font-black bg-green-50/30 text-green-600 print:text-black print:text-base">
                            {format(dataSaida, 'dd/MM/yyyy')} 
                            {isVencido && <span className="block text-[9px] uppercase font-bold text-green-700 no-print mt-1">Prazo Alcançado ✅</span>}
                          </td>
                        ) : (
                          <td className="p-4 text-center">
                            <div className="font-bold text-blue-700 uppercase text-[10px] print:text-black print:text-base">{item.motivoSaida}</div>
                            {item.observacao && <div className="text-[10px] text-slate-400 italic print:text-black print:text-base">Obs: {item.observacao}</div>}
                          </td>
                        )}
                        <td className="p-4 text-center no-print">
                           {currentTab === 'ativos' ? (
                             <form action={arquivarAdolescente} className="flex flex-col gap-1 items-center bg-slate-50 p-2 rounded border border-slate-200 w-40 mx-auto">
                               <input type="hidden" name="id" value={item.id} />
                               <select name="motivo" className="text-[10px] border rounded p-1 w-full bg-white outline-none cursor-pointer"><option value="DESLIGADO">DESLIGADO</option><option value="INTERNAÇÃO">INTERNAÇÃO</option></select>
                               <input name="observacao" placeholder="Observações de saída" className="text-[10px] border rounded p-1 w-full outline-none" />
                               <button className="text-green-600 flex items-center justify-center gap-1 font-bold text-[10px] uppercase hover:underline mt-1 w-full"><CheckCircle size={14} /> Confirmar Baixa</button>
                             </form>
                           ) : (
                             <div className="flex justify-center gap-2">
                               <form action={async () => { 'use server'; await reativarAdolescente(item.id); }}><button className="text-orange-500 hover:bg-orange-50 p-1 rounded transition" title="Reativar"><RotateCcw size={18}/></button></form>
                               <form action={async () => { 'use server'; await deleteGeneral(item.id, 'ado'); }}><button className="text-slate-300 hover:text-red-600 p-1 transition"><Trash2 size={18}/></button></form>
                             </div>
                           )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MÓDULO 2: CONTROLE DE INTERNAÇÃO (NOVO) */}
        {/* ========================================================= */}
        {currentMod === 'controle_internacao' && (
          <div className="bg-white shadow-xl rounded-b-xl overflow-hidden print:shadow-none print:rounded-none">
            {currentTab === "ativos" && (
              <div className="p-6 border-b bg-blue-50/30 no-print">
                <form action={addControleInternacao} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Nome Completo</label>
                    <input name="nome" required className="w-full border p-2 rounded text-sm uppercase outline-none focus:ring-2 ring-blue-500" placeholder="NOME DO ADOLESCENTE" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Tipo de Sistema</label>
                    <select name="tipo" className="w-full border p-2 rounded text-sm bg-white outline-none focus:ring-2 ring-blue-500">
                      <option value="Internação Provisória">Internação Provisória</option>
                      <option value="Atendimento Inicial">Atendimento Inicial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Data de Admissão</label>
                    <input name="dataAdmissao" type="date" required className="w-full border p-2 rounded text-sm outline-none focus:ring-2 ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Comarca</label>
                    <div className="flex gap-2">
                      <input name="comarca" required className="w-full border p-2 rounded text-sm uppercase outline-none focus:ring-2 ring-blue-500" placeholder="COMARCA" />
                      <button type="submit" className="bg-blue-600 text-white font-bold px-4 py-2 rounded text-sm shadow-md hover:bg-blue-700 transition uppercase">+</button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold border-b print:bg-gray-100">
                    <th className="p-4 w-12 text-center">#</th><th className="p-4 text-left">Nome</th><th className="p-4 text-center">Tipo de Sistema</th><th className="p-4 text-center">Admissão</th><th className="p-4 text-center">Comarca</th><th className="p-4 text-center no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(currentTab === 'ativos' ? ativosCtrl : histCtrl).map((ctrl, index) => (
                    <tr key={ctrl.id} className="hover:bg-blue-50/10 transition group print:break-inside-avoid">
                      <td className="p-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                      <td className="p-4 font-bold uppercase print:text-black print:text-base">{ctrl.nome}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase print:text-black print:text-base print:p-0 ${ctrl.tipo === 'Internação Provisória' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'}`}>
                          {ctrl.tipo}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-700 print:text-black print:text-base">{format(parseISO(ctrl.dataAdmissao), 'dd/MM/yyyy')}</td>
                      <td className="p-4 text-center font-bold uppercase print:text-black print:text-base">{ctrl.comarca}</td>
                      <td className="p-4 text-center no-print flex justify-center gap-2">
                        {currentTab === 'ativos' ? (
                          <form action={async () => { 'use server'; await arquivarControleInternacao(ctrl.id); }}><button className="text-blue-600 hover:bg-blue-50 p-1 rounded transition" title="Concluir / Dar Baixa"><CheckCircle size={18}/></button></form>
                        ) : (
                          <div className="flex justify-center gap-2">
                             <form action={async () => { 'use server'; await reativarControleInternacao(ctrl.id); }}><button className="text-orange-500 hover:bg-orange-50 p-1 rounded transition" title="Reativar"><RotateCcw size={18}/></button></form>
                             <form action={async () => { 'use server'; await deleteGeneral(ctrl.id, 'ctrl'); }}><button className="text-slate-300 hover:text-red-600 p-1 transition"><Trash2 size={18}/></button></form>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MÓDULO 3: RELATÓRIOS */}
        {/* ========================================================= */}
        {currentMod === 'relatorios' && (
          <div className="bg-white shadow-xl rounded-b-xl overflow-hidden print:shadow-none print:rounded-none">
            {currentTab === "ativos" && (
              <div className="p-6 border-b bg-indigo-50/30 no-print">
                <form action={addRelatorio} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <input name="nome" required className="border p-2 rounded text-sm uppercase outline-none focus:ring-2 ring-indigo-500" placeholder="NOME DO ADOLESCENTE" />
                  <input name="processo" required className="border p-2 rounded text-sm outline-none" placeholder="Nº PROCESSO" />
                  <input name="dataEntrega" type="date" required className="border p-2 rounded text-sm outline-none" />
                  <button type="submit" className="bg-indigo-600 text-white font-bold py-2 rounded text-sm shadow-md hover:bg-indigo-700 uppercase transition">Registrar</button>
                </form>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold border-b print:bg-gray-100">
                    <th className="p-4 w-12 text-center">#</th><th className="p-4 text-left">Nome</th><th className="p-4 text-center">Processo</th><th className="p-4 text-center">Data Limite / Entrega</th><th className="p-4 text-center no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(currentTab === 'ativos' ? ativosRel : histRel).map((rel, index) => (
                    <tr key={rel.id} className="hover:bg-indigo-50/10 transition group print:break-inside-avoid">
                      <td className="p-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                      <td className="p-4 font-bold uppercase print:text-black print:text-base">{rel.nome}</td>
                      <td className="p-4 text-center font-mono text-xs print:text-black print:text-base">{rel.nProcesso}</td>
                      <td className="p-4 text-center font-bold text-indigo-700 print:text-black print:text-base">{format(parseISO(rel.dataEntrega), 'dd/MM/yyyy')}</td>
                      <td className="p-4 text-center no-print flex justify-center gap-2">
                        {currentTab === 'ativos' ? (
                          <form action={async () => { 'use server'; await arquivarRelatorio(rel.id); }}><button className="text-green-600 hover:bg-green-50 p-1 rounded transition" title="Marcar como Entregue"><CheckCircle size={18}/></button></form>
                        ) : (
                          <div className="flex justify-center gap-2">
                             <form action={async () => { 'use server'; await reativarRelatorio(rel.id); }}><button className="text-orange-500 hover:bg-orange-50 p-1 rounded transition" title="Reativar"><RotateCcw size={18}/></button></form>
                             <form action={async () => { 'use server'; await deleteGeneral(rel.id, 'rel'); }}><button className="text-slate-300 hover:text-red-600 p-1 transition"><Trash2 size={18}/></button></form>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MÓDULO 4: AUDIÊNCIAS */}
        {/* ========================================================= */}
        {currentMod === 'audiencias' && (
          <div className="bg-white shadow-xl rounded-b-xl overflow-hidden print:shadow-none print:rounded-none">
            
            {currentTab === "ativos" && <AudienciaForm />}
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold border-b print:bg-gray-100">
                    <th className="p-4 w-12 text-center">#</th><th className="p-4 text-left">Processo</th><th className="p-4 text-left">Adolescentes</th><th className="p-4 text-center">Data / Hora</th><th className="p-4 text-center no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(currentTab === 'ativos' ? ativosAud : histAud).map((aud, index) => (
                    <tr key={aud.id} className="hover:bg-emerald-50/10 transition group print:break-inside-avoid">
                      <td className="p-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                      <td className="p-4 font-bold text-emerald-800 uppercase print:text-black print:text-base">{aud.nProcesso}</td>
                      <td className="p-4 uppercase text-[11px] leading-relaxed italic print:text-black print:text-base">{aud.nomes}</td>
                      <td className="p-4 text-center font-bold print:text-black print:text-base">{format(parseISO(aud.data), 'dd/MM/yy')} às {aud.hora}</td>
                      <td className="p-4 text-center no-print flex justify-center gap-2">
                        {currentTab === 'ativos' ? (
                          <form action={async () => { 'use server'; await arquivarAudiencia(aud.id); }}><button className="text-green-600 hover:bg-green-50 p-1 rounded transition" title="Concluir Audiência"><CheckCircle size={18}/></button></form>
                        ) : (
                          <div className="flex justify-center gap-2">
                             <form action={async () => { 'use server'; await reativarAudiencia(aud.id); }}><button className="text-orange-500 hover:bg-orange-50 p-1 rounded transition" title="Reativar"><RotateCcw size={18}/></button></form>
                             <form action={async () => { 'use server'; await deleteGeneral(aud.id, 'aud'); }}><button className="text-slate-300 hover:text-red-600 p-1 transition"><Trash2 size={18}/></button></form>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LEGENDA GERAL INFORMATIVA E COLORIDA */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 no-print text-[10px] uppercase font-black">
          <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 shadow-sm">
             <div className="flex items-center gap-2 mb-1"><Info size={14}/> FASE (45 DIAS)</div>
             <p className="font-bold lowercase text-[10px] first-letter:uppercase opacity-80">Monitora o tempo de internação. Use a aba de Histórico para ver baixas.</p>
          </div>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-200 shadow-sm">
             <div className="flex items-center gap-2 mb-1"><Building size={14}/> INTERNAÇÃO GERAL</div>
             <p className="font-bold lowercase text-[10px] first-letter:uppercase opacity-80">Controle geral de admissão. Separa entre Atendimento Inicial e Int. Provisória.</p>
          </div>
          <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl border border-indigo-200 shadow-sm">
             <div className="flex items-center gap-2 mb-1"><FileText size={14}/> RELATÓRIOS</div>
             <p className="font-bold lowercase text-[10px] first-letter:uppercase opacity-80">Clique no ✅ para marcar um relatório como entregue ao judiciário.</p>
          </div>
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 shadow-sm">
             <div className="flex items-center gap-2 mb-1"><Calendar size={14}/> AUDIÊNCIAS</div>
             <p className="font-bold lowercase text-[10px] first-letter:uppercase opacity-80">Agenda as oitivas. Após realizadas, clique em ✅ para limpar a agenda.</p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest italic no-print">Sistema de Gestão Sócioeducativa Timon-MA v4.0</p>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 landscape; /* Força modo paisagem (deitado) */
            margin: 10mm;
          }
          .no-print { display: none !important; }
          body { 
            background-color: white !important; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
          }
          table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            table-layout: auto !important;
          }
          th, td { 
            border: 1.5px solid #000 !important; 
            padding: 12px 8px !important; 
            font-size: 13pt !important; 
            white-space: nowrap !important; /* Proíbe quebra de linha */
            color: black !important;
            text-align: left !important;
          }
          th { 
            background-color: #f2f2f2 !important; 
            text-align: center !important;
            font-size: 11pt !important;
          }
          td:nth-child(n+3) { text-align: center !important; }
        }
      `}} />
    </div>
  );
}