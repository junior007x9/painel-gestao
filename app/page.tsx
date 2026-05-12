export const dynamic = 'force-dynamic';

import { db } from "@/db";
import { adolescentes, relatorios, audiencias } from "@/db/schema";
import { eq } from "drizzle-orm";
import { addDays, format, parseISO, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, PlusCircle, History, Users, CheckCircle, RotateCcw, Info, FileText, ClipboardList, Calendar, Plus } from 'lucide-react';
import { 
  addAdolescente, 
  deleteAdolescente, 
  arquivarAdolescente, 
  reativarAdolescente, 
  addRelatorio, 
  marcarComoEntregue, 
  deleteRelatorio,
  deleteAudiencia 
} from "./actions";
import PrintButton from "./PrintButton";
import AudienciaForm from "./AudienciaForm";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { mod?: string, tab?: string };
}) {
  const params = await searchParams;
  const currentMod = params.mod || "internacao"; // 'internacao', 'relatorios' ou 'audiencias'
  const currentTab = params.tab || "ativos";

  // Busca Dados de todos os módulos
  const ativos = await db.select().from(adolescentes).where(eq(adolescentes.status, 'ativo'));
  const historico = await db.select().from(adolescentes).where(eq(adolescentes.status, 'arquivado'));
  const todosRelatorios = await db.select().from(relatorios);
  const todasAudiencias = await db.select().from(audiencias);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto">
        
        {/* SELETOR DE MÓDULO (INTERCALADOR) */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 no-print">
          <a href="?mod=internacao" className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition shadow-sm ${currentMod === 'internacao' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
            <Users size={18} /> CONTROLE 45 DIAS
          </a>
          <a href="?mod=relatorios" className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition shadow-sm ${currentMod === 'relatorios' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
            <FileText size={18} /> RELATÓRIOS
          </a>
          <a href="?mod=audiencias" className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition shadow-sm ${currentMod === 'audiencias' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
            <Calendar size={18} /> AUDIÊNCIAS
          </a>
        </div>

        {/* CABEÇALHO DINÂMICO */}
        <div className={`bg-white p-6 rounded-t-xl border-b-2 shadow-sm text-center print:border-b-4 print:border-black print:shadow-none ${currentMod === 'relatorios' ? 'border-indigo-500' : currentMod === 'audiencias' ? 'border-emerald-500' : 'border-slate-200'}`}>
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] print:text-black">Estado do Maranhão • Timon</h2>
          <h1 className="text-xl font-black uppercase mt-1 text-slate-800 print:text-black">
            {currentMod === 'internacao' ? "Controle Socioeducativo - 45 Dias" : currentMod === 'relatorios' ? "Relatórios de Acompanhamento" : "Controle de Audiências Judiciais"}
          </h1>
          <p className="text-xs text-slate-500 mt-1 capitalize print:text-black">
            {format(new Date(), "eeee, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <div className="no-print">
            <PrintButton />
          </div>
        </div>

        {/* --- MÓDULO 45 DIAS --- */}
        {currentMod === 'internacao' && (
          <div className="bg-white shadow-xl rounded-b-xl overflow-hidden print:shadow-none">
            <div className="bg-white border-b flex px-6 no-print">
              <a href="?mod=internacao&tab=ativos" className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition ${currentTab === 'ativos' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-400'}`}>
                ATIVOS ({ativos.length})
              </a>
              <a href="?mod=internacao&tab=historico" className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition ${currentTab === 'historico' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-400'}`}>
                HISTÓRICO ({historico.length})
              </a>
            </div>

            {currentTab === "ativos" && (
              <div className="p-6 border-b bg-slate-50/50 no-print">
                <form action={addAdolescente} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <input name="nome" required className="border p-2 rounded text-sm uppercase outline-none" placeholder="NOME DO ADOLESCENTE" />
                  <input name="dataApreensao" type="date" required className="border p-2 rounded text-sm outline-none" />
                  <input name="dataAdmissao" type="date" required className="border p-2 rounded text-sm outline-none" />
                  <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded text-sm shadow-md transition uppercase">Cadastrar</button>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold border-b print:bg-gray-200">
                    <th className="p-4 w-12">#</th>
                    <th className="p-4 text-left">Nome</th>
                    <th className="p-4 text-center">Apreensão</th>
                    {currentTab === "ativos" ? <th className="p-4 text-center">Prazo 45 Dias</th> : <th className="p-4 text-center">Desfecho</th>}
                    <th className="p-4 text-center no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(currentTab === 'ativos' ? ativos : historico).map((item, index) => {
                    const dataSaida = addDays(parseISO(item.dataApreensao), 44);
                    const isVencido = isAfter(new Date(), dataSaida);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition group print:break-inside-avoid">
                        <td className="p-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                        <td className="p-4 font-bold uppercase">{item.nome}</td>
                        <td className="p-4 text-center">{format(parseISO(item.dataApreensao), 'dd/MM/yyyy')}</td>
                        {currentTab === "ativos" ? (
                          <td className="p-4 text-center font-black bg-green-50/30 text-green-600">
                            {format(dataSaida, 'dd/MM/yyyy')}
                            {isVencido && <span className="block text-[9px] uppercase font-bold">Prazo Alcançado ✅</span>}
                          </td>
                        ) : (
                          <td className="p-4 text-center font-bold text-blue-700 uppercase text-xs">{item.motivoSaida}</td>
                        )}
                        <td className="p-4 text-center no-print flex justify-center gap-2 pt-6">
                           {currentTab === 'ativos' ? (
                             <form action={arquivarAdolescente} className="flex gap-1 items-center bg-slate-50 p-1 rounded border">
                               <input type="hidden" name="id" value={item.id} />
                               <select name="motivo" className="text-[10px] border rounded p-1 bg-white"><option value="DESLIGADO text-xs">DESLIGADO</option><option value="INTERNAÇÃO">INTERNAÇÃO</option></select>
                               <button className="text-green-600 font-bold text-[10px] uppercase">Baixar</button>
                             </form>
                           ) : (
                             <form action={async () => { 'use server'; await reativarAdolescente(item.id); }}><button className="text-orange-500"><RotateCcw size={18}/></button></form>
                           )}
                           <form action={async () => { 'use server'; await deleteAdolescente(item.id); }}><button className="text-slate-300 hover:text-red-600"><Trash2 size={18}/></button></form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- MÓDULO RELATÓRIOS --- */}
        {currentMod === 'relatorios' && (
          <div className="bg-white shadow-xl rounded-b-xl overflow-hidden print:shadow-none">
            <div className="p-6 border-b bg-indigo-50/30 no-print">
              <form action={addRelatorio} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <input name="nome" required className="border p-2 rounded text-sm uppercase outline-none" placeholder="NOME DO ADOLESCENTE" />
                <input name="processo" required className="border p-2 rounded text-sm outline-none" placeholder="Nº PROCESSO" />
                <input name="dataEntrega" type="date" required className="border p-2 rounded text-sm outline-none" />
                <button type="submit" className="bg-indigo-600 text-white font-bold py-2 rounded text-sm shadow-md hover:bg-indigo-700 uppercase">Registrar</button>
              </form>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold border-b">
                  <th className="p-4 w-12">#</th><th className="p-4 text-left">Nome</th><th className="p-4 text-center">Processo</th><th className="p-4 text-center">Entrega</th><th className="p-4 text-center">Status</th><th className="p-4 text-center no-print">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todosRelatorios.map((rel, index) => (
                  <tr key={rel.id} className="hover:bg-indigo-50/10 transition group">
                    <td className="p-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                    <td className="p-4 font-bold uppercase">{rel.nome}</td>
                    <td className="p-4 text-center font-mono text-xs">{rel.nProcesso}</td>
                    <td className="p-4 text-center">{format(parseISO(rel.dataEntrega), 'dd/MM/yyyy')}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${rel.status === 'entregue' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{rel.status}</span>
                    </td>
                    <td className="p-4 text-center no-print flex justify-center gap-2">
                      {rel.status === 'pendente' && (
                        <form action={async () => { 'use server'; await marcarComoEntregue(rel.id); }}><button className="text-green-600"><CheckCircle size={18}/></button></form>
                      )}
                      <form action={async () => { 'use server'; await deleteRelatorio(rel.id); }}><button className="text-slate-300 hover:text-red-600"><Trash2 size={18}/></button></form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- MÓDULO AUDIÊNCIAS --- */}
        {currentMod === 'audiencias' && (
          <div className="bg-white shadow-xl rounded-b-xl overflow-hidden print:shadow-none">
            
            {/* NOVO FORMULÁRIO DINÂMICO IMPORTADO */}
            <AudienciaForm />
            
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold border-b">
                  <th className="p-4 w-12 text-center">#</th><th className="p-4 text-left">Processo</th><th className="p-4 text-left">Adolescentes</th><th className="p-4 text-center">Data / Hora</th><th className="p-4 text-center no-print">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todasAudiencias.map((aud, index) => (
                  <tr key={aud.id} className="hover:bg-emerald-50/10 transition group">
                    <td className="p-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                    <td className="p-4 font-bold text-emerald-800 uppercase">{aud.nProcesso}</td>
                    <td className="p-4 uppercase text-[11px] leading-relaxed italic">{aud.nomes}</td>
                    <td className="p-4 text-center font-bold">{format(parseISO(aud.data), 'dd/MM/yy')} às {aud.hora}</td>
                    <td className="p-4 text-center no-print">
                      <form action={async () => { 'use server'; await deleteAudiencia(aud.id); }}><button className="text-slate-300 hover:text-red-600"><Trash2 size={18}/></button></form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* LEGENDA GERAL INFORMATIVA E COLORIDA */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 no-print text-[10px] uppercase font-black">
          <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 shadow-sm">
             <div className="flex items-center gap-2 mb-1"><Info size={14}/> Controle 45 Dias</div>
             <p className="font-bold lowercase text-xs first-letter:uppercase opacity-80">Monitora o tempo de internação provisória. O status verde indica que o prazo legal foi alcançado.</p>
          </div>
          <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl border border-indigo-200 shadow-sm">
             <div className="flex items-center gap-2 mb-1"><FileText size={14}/> Relatórios</div>
             <p className="font-bold lowercase text-xs first-letter:uppercase opacity-80">Controla o envio de relatórios ao judiciário. Marque como entregue para manter o controle em dia.</p>
          </div>
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 shadow-sm">
             <div className="flex items-center gap-2 mb-1"><Calendar size={14}/> Audiências</div>
             <p className="font-bold lowercase text-xs first-letter:uppercase opacity-80">Agenda as datas das audiências. Use o botão "+" no formulário para adicionar vários adolescentes ao mesmo processo.</p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest italic no-print">Sistema de Gestão Sócioeducativa Timon-MA v2.1</p>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; }
          table { border-collapse: collapse !important; width: 100% !important; border: 1px solid #000 !important; }
          th, td { border: 1px solid #000 !important; color: black !important; padding: 10px !important; }
        }
      `}} />
    </div>
  );
}