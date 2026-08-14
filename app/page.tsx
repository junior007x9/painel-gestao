export const dynamic = 'force-dynamic';

import { db } from "@/db";
import { adolescentes, relatorios, audiencias, controleInternacao } from "@/db/schema";
import { eq } from "drizzle-orm";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, Info, FileText, Calendar, Building, Pencil, XCircle } from 'lucide-react';
import { 
  addAdolescente, editAdolescente, 
  addRelatorio, editRelatorio, 
  addControleInternacao, editControleInternacao 
} from "./actions";
import PrintButton from "./PrintButton";
import AudienciaForm from "./AudienciaForm";
import { TabelaRelatorios, TabelaAudiencias, TabelaAdolescentes, TabelaControleInternacao } from "./TabelasArrastaveis";

export default async function Dashboard({ searchParams }: { searchParams: { mod?: string, tab?: string, editId?: string } }) {
  const params = await searchParams;
  const currentMod = params.mod || "internacao";
  const currentTab = params.tab || "ativos";
  const editId = params.editId ? parseInt(params.editId) : null; 

  const ordenarDados = (dados: any[], campoData: string) => {
    return dados.sort((a, b) => {
      if (a.ordem !== b.ordem) return (a.ordem || 0) - (b.ordem || 0);
      return new Date(a[campoData]).getTime() - new Date(b[campoData]).getTime();
    });
  };

  const ativosAdoBrutos = await db.select().from(adolescentes).where(eq(adolescentes.status, 'ativo'));
  const ativosAdo = ordenarDados(ativosAdoBrutos, 'dataApreensao');
  const histAdoBrutos = await db.select().from(adolescentes).where(eq(adolescentes.status, 'arquivado'));
  const histAdo = ordenarDados(histAdoBrutos, 'dataApreensao');
  
  const ativosCtrlBrutos = await db.select().from(controleInternacao).where(eq(controleInternacao.status, 'ativo'));
  const ativosCtrl = ordenarDados(ativosCtrlBrutos, 'dataAdmissao');
  const histCtrlBrutos = await db.select().from(controleInternacao).where(eq(controleInternacao.status, 'arquivado'));
  const histCtrl = ordenarDados(histCtrlBrutos, 'dataAdmissao');

  const relatoriosBrutosAtivos = await db.select().from(relatorios).where(eq(relatorios.status, 'ativo'));
  const ativosRel = ordenarDados(relatoriosBrutosAtivos, 'dataEntrega');
  const relatoriosBrutosHist = await db.select().from(relatorios).where(eq(relatorios.status, 'arquivado'));
  const histRel = ordenarDados(relatoriosBrutosHist, 'dataEntrega');

  const audienciasBrutasAtivas = await db.select().from(audiencias).where(eq(audiencias.status, 'ativo'));
  const ativosAud = ordenarDados(audienciasBrutasAtivas, 'data');
  const audienciasBrutasHist = await db.select().from(audiencias).where(eq(audiencias.status, 'arquivado'));
  const histAud = ordenarDados(audienciasBrutasHist, 'data');

  let colorTheme = { border: 'border-slate-200', btn: 'border-slate-600 text-slate-700 bg-slate-50' };
  if (currentMod === 'internacao') colorTheme = { border: 'border-green-600', btn: 'border-green-600 text-green-700 bg-green-50' };
  if (currentMod === 'relatorios') colorTheme = { border: 'border-indigo-600', btn: 'border-indigo-600 text-indigo-700 bg-indigo-50' };
  if (currentMod === 'audiencias') colorTheme = { border: 'border-emerald-600', btn: 'border-emerald-600 text-emerald-700 bg-emerald-50' };
  if (currentMod === 'controle_internacao') colorTheme = { border: 'border-blue-600', btn: 'border-blue-600 text-blue-700 bg-blue-50' };

  const editAdo = editId && currentMod === 'internacao' ? [...ativosAdo, ...histAdo].find(i => i.id === editId) : null;
  const editCtrl = editId && currentMod === 'controle_internacao' ? [...ativosCtrl, ...histCtrl].find(i => i.id === editId) : null;
  const editRel = editId && currentMod === 'relatorios' ? [...ativosRel, ...histRel].find(i => i.id === editId) : null;
  const editAud = editId && currentMod === 'audiencias' ? [...ativosAud, ...histAud].find(i => i.id === editId) : null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 print:bg-white print:p-0">
      {/* Wrapper Especial que segura toda a folha */}
      <div className="max-w-7xl mx-auto print:max-w-none print-wrapper">
        
        <div className="flex flex-wrap justify-center gap-2 mb-6 no-print">
          <a href="?mod=internacao" className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition shadow-sm ${currentMod === 'internacao' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
            <Users size={18} /> FASE (45 DIAS)
          </a>
          <a href="?mod=controle_internacao" className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition shadow-sm ${currentMod === 'controle_internacao' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
            <Building size={18} /> INTERNAÇÃO GERAL
          </a>
          <a href="?mod=relatorios" className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition shadow-sm ${currentMod === 'relatorios' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
            <FileText size={18} /> RELATÓRIOS
          </a>
          <a href="?mod=audiencias" className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition shadow-sm ${currentMod === 'audiencias' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
            <Calendar size={18} /> AUDIÊNCIAS
          </a>
        </div>

        {/* CABEÇALHO OTIMIZADO PARA OCUPAR MENOS ESPAÇO NA IMPRESSÃO */}
        <div className={`bg-white rounded-t-xl border-b-2 shadow-sm text-center print:border-b-2 print:border-black print:shadow-none overflow-hidden print-header ${colorTheme.border}`}>
          <div className="p-6 flex flex-col items-center justify-center print:flex-row print:justify-between print:py-3 print:px-4">
            
            {/* Logo na Impressão fica à esquerda */}
            <div className="print:w-1/4 flex justify-start">
              <img 
                src="/bandeira-ma.png" 
                alt="Bandeira do Estado do Maranhão" 
                className="w-16 h-auto mb-3 shadow-sm rounded-sm mx-auto print:mx-0 print:mb-0 print:w-20"
              />
            </div>
            
            {/* Títulos no centro */}
            <div className="print:w-2/4 flex flex-col items-center justify-center">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] print:text-black print:text-[12px]">
                Estado do Maranhão • Timon
              </h2>
              <h1 className="text-xl md:text-2xl font-black uppercase mt-1 text-slate-800 print:text-black print:text-[18px] print:leading-tight">
                FUNDAÇÃO DE ATENDIMENTO SOCIOEDUCATIVO DO MARANHÃO - FASE/MA
              </h1>
              
              <h3 className="text-sm font-bold text-slate-500 mt-2 bg-slate-100 px-4 py-1 rounded-full uppercase print:bg-transparent print:border-2 print:border-black print:text-black print:py-0.5 print:mt-2 print:text-[14px]">
                {currentMod === 'internacao' && "FASE (45 DIAS)"}
                {currentMod === 'controle_internacao' && "Controle de Internação e Atendimento Inicial"}
                {currentMod === 'relatorios' && "Relatórios de Acompanhamento"}
                {currentMod === 'audiencias' && "Controle de Audiências Judiciais"}
              </h3>
            </div>

            {/* Data e Hora na Impressão ficam à direita */}
            <div className="print:w-1/4 hidden print:flex flex-col items-end justify-center">
               <p className="font-bold text-[14px] uppercase text-black">
                  {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
               </p>
            </div>

            {/* Data visual na tela Desktop */}
            <p className="text-xs text-slate-500 mt-3 capitalize print:hidden">
              {format(new Date(), "eeee, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>

            <div className="no-print mt-3">
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

        {/* ÁREA DA TABELA - ELA VAI PREENCHER TODO O ESPAÇO */}
        <div className="print-content-area">
          {currentMod === 'internacao' && (
            <div className="bg-white shadow-xl rounded-b-xl overflow-hidden print:shadow-none print:rounded-none flex-1 flex flex-col">
              {(currentTab === "ativos" || editAdo) && (
                <div className={`p-6 border-b no-print ${editAdo ? 'bg-amber-50' : 'bg-slate-50/50'}`}>
                  {editAdo && <h3 className="text-xs font-bold uppercase text-amber-700 mb-4 flex items-center gap-2"><Pencil size={14}/> Editar Cadastro</h3>}
                  <form action={editAdo ? editAdolescente : addAdolescente} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {editAdo && <input type="hidden" name="id" value={editAdo.id} />}
                    <input name="nome" required defaultValue={editAdo?.nome} className={`border p-2 rounded text-sm uppercase outline-none focus:ring-2 ${editAdo ? 'ring-amber-500' : 'ring-green-500'}`} placeholder="NOME DO ADOLESCENTE" />
                    <input name="dataApreensao" type="date" required defaultValue={editAdo?.dataApreensao} className="border p-2 rounded text-sm outline-none" title="Data da Apreensão" />
                    <input name="dataAdmissao" type="date" required defaultValue={editAdo?.dataAdmissao} className="border p-2 rounded text-sm outline-none" title="Data de Admissão na Unidade" />
                    <div className="flex gap-2">
                      <button type="submit" className={`w-full text-white font-bold py-2 rounded text-sm shadow-md transition uppercase ${editAdo ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}>
                        {editAdo ? "Salvar" : "Cadastrar"}
                      </button>
                      {editAdo && <a href={`?mod=internacao&tab=${currentTab}`} className="bg-red-500 text-white font-bold py-2 px-3 rounded text-sm shadow-md transition hover:bg-red-600"><XCircle size={18}/></a>}
                    </div>
                  </form>
                </div>
              )}
              <TabelaAdolescentes dados={currentTab === 'ativos' ? ativosAdo : histAdo} currentTab={currentTab} />
            </div>
          )}

          {currentMod === 'controle_internacao' && (
            <div className="bg-white shadow-xl rounded-b-xl overflow-hidden print:shadow-none print:rounded-none flex-1 flex flex-col">
              {(currentTab === "ativos" || editCtrl) && (
                <div className={`p-6 border-b no-print ${editCtrl ? 'bg-amber-50' : 'bg-blue-50/30'}`}>
                  {editCtrl && <h3 className="text-xs font-bold uppercase text-amber-700 mb-4 flex items-center gap-2"><Pencil size={14}/> Editar Cadastro</h3>}
                  <form action={editCtrl ? editControleInternacao : addControleInternacao} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    {editCtrl && <input type="hidden" name="id" value={editCtrl.id} />}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Nome Completo</label>
                      <input name="nome" required defaultValue={editCtrl?.nome} className={`w-full border p-2 rounded text-sm uppercase outline-none focus:ring-2 ${editCtrl ? 'ring-amber-500' : 'ring-blue-500'}`} placeholder="NOME" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Tipo de Sistema</label>
                      <select name="tipo" defaultValue={editCtrl?.tipo} className={`w-full border p-2 rounded text-sm bg-white outline-none focus:ring-2 ${editCtrl ? 'ring-amber-500' : 'ring-blue-500'}`}>
                        <option value="Internação Provisória">Internação Provisória</option>
                        <option value="Atendimento Inicial">Atendimento Inicial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Data de Admissão</label>
                      <input name="dataAdmissao" type="date" required defaultValue={editCtrl?.dataAdmissao} className="w-full border p-2 rounded text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Comarca</label>
                      <div className="flex gap-2">
                        <input name="comarca" required defaultValue={editCtrl?.comarca} className="w-full border p-2 rounded text-sm uppercase outline-none" placeholder="COMARCA" />
                        {editCtrl ? (
                          <a href={`?mod=controle_internacao&tab=${currentTab}`} className="bg-red-500 text-white font-bold p-2.5 rounded text-sm shadow-md transition hover:bg-red-600"><XCircle size={18}/></a>
                        ) : (
                          <button type="submit" className="bg-blue-600 text-white font-bold px-4 py-2 rounded text-sm shadow-md hover:bg-blue-700 transition uppercase">+</button>
                        )}
                      </div>
                    </div>
                    {editCtrl && (
                       <div className="md:col-span-5"><button type="submit" className="w-full bg-amber-600 text-white font-bold py-3 rounded text-sm shadow-md uppercase hover:bg-amber-700 transition">Salvar Alterações</button></div>
                    )}
                  </form>
                </div>
              )}
              <TabelaControleInternacao dados={currentTab === 'ativos' ? ativosCtrl : histCtrl} currentTab={currentTab} />
            </div>
          )}

          {currentMod === 'relatorios' && (
            <div className="bg-white shadow-xl rounded-b-xl overflow-hidden print:shadow-none print:rounded-none flex-1 flex flex-col">
              {(currentTab === "ativos" || editRel) && (
                <div className={`p-6 border-b no-print ${editRel ? 'bg-amber-50' : 'bg-indigo-50/30'}`}>
                  {editRel && <h3 className="text-xs font-bold uppercase text-amber-700 mb-4 flex items-center gap-2"><Pencil size={14}/> Editar Relatório</h3>}
                  <form action={editRel ? editRelatorio : addRelatorio} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {editRel && <input type="hidden" name="id" value={editRel.id} />}
                    <input name="nome" required defaultValue={editRel?.nome} className={`border p-2 rounded text-sm uppercase outline-none focus:ring-2 ${editRel ? 'ring-amber-500' : 'ring-indigo-500'}`} placeholder="NOME DO ADOLESCENTE" />
                    <input name="processo" required defaultValue={editRel?.nProcesso} className="border p-2 rounded text-sm outline-none" placeholder="Nº PROCESSO" />
                    <input name="dataEntrega" type="date" required defaultValue={editRel?.dataEntrega} className="border p-2 rounded text-sm outline-none" />
                    <div className="flex gap-2">
                      <button type="submit" className={`w-full text-white font-bold py-2 rounded text-sm shadow-md uppercase transition ${editRel ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{editRel ? "Salvar" : "Registrar"}</button>
                      {editRel && <a href={`?mod=relatorios&tab=${currentTab}`} className="bg-red-500 text-white font-bold py-2 px-3 rounded text-sm shadow-md transition hover:bg-red-600"><XCircle size={18}/></a>}
                    </div>
                  </form>
                </div>
              )}
              <TabelaRelatorios dados={currentTab === 'ativos' ? ativosRel : histRel} currentTab={currentTab} />
            </div>
          )}

          {currentMod === 'audiencias' && (
            <div className="bg-white shadow-xl rounded-b-xl overflow-hidden print:shadow-none print:rounded-none flex-1 flex flex-col">
              {(currentTab === "ativos" || editAud) && <AudienciaForm editData={editAud} />}
              <TabelaAudiencias dados={currentTab === 'ativos' ? ativosAud : histAud} currentTab={currentTab} />
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 no-print text-[10px] uppercase font-black">
          <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 shadow-sm">
             <div className="flex items-center gap-2 mb-1"><Info size={14}/> FASE (45 DIAS)</div>
             <p className="font-bold lowercase text-[10px] first-letter:uppercase opacity-80">Monitora o tempo de internação.</p>
          </div>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-200 shadow-sm">
             <div className="flex items-center gap-2 mb-1"><Building size={14}/> INTERNAÇÃO GERAL</div>
             <p className="font-bold lowercase text-[10px] first-letter:uppercase opacity-80">Controle geral de admissão.</p>
          </div>
          <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl border border-indigo-200 shadow-sm">
             <div className="flex items-center gap-2 mb-1"><FileText size={14}/> RELATÓRIOS</div>
             <p className="font-bold lowercase text-[10px] first-letter:uppercase opacity-80">Marque os relatórios judiciais entregues.</p>
          </div>
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 shadow-sm">
             <div className="flex items-center gap-2 mb-1"><Calendar size={14}/> AUDIÊNCIAS</div>
             <p className="font-bold lowercase text-[10px] first-letter:uppercase opacity-80">Agenda as oitivas agendadas.</p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest italic no-print">Sistema de Gestão Sócioeducativa Timon-MA v5.0</p>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          
          .no-print, .hide-print { display: none !important; }
          
          /* Zera as margens da página HTML */
          body, html { margin: 0; padding: 0; background-color: white !important; height: 100% !important; overflow: hidden; }
          
          /* Container principal ocupando a altura inteira da folha */
          .print-wrapper {
            display: flex !important;
            flex-direction: column !important;
            height: 98vh !important;
            max-height: 98vh !important;
          }
          
          .print-header { flex-shrink: 0 !important; }
          
          /* Área da tabela pegando todo o espaço disponível que sobra */
          .print-content-area {
            flex-grow: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            margin-top: 10px !important;
          }
          
          .print-content-area > div, 
          .print-content-area .overflow-x-auto {
            flex-grow: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            height: 100% !important;
          }

          /* A Tabela estica suas células para bater no fundo da folha */
          table { 
            width: 100% !important; 
            height: 100% !important; 
            border-collapse: collapse !important; 
            table-layout: auto !important; 
          }
          
          /* Estilo super encorpado para o PDF final */
          th, td { 
            border: 2px solid #1e293b !important; 
            color: #000 !important; 
            font-size: 13pt !important; /* Fonte bem maior e mais visível */
            font-weight: 700 !important; 
            padding: 4px 10px !important;
          }
          
          th { 
            background-color: #f1f5f9 !important; 
            font-weight: 900 !important; 
            text-transform: uppercase !important;
            font-size: 11pt !important;
            height: 40px !important; /* Mantém o cabeçalho mais estreito que as linhas de dados */
          }

          /* Força alinhamento da coluna de Nome para a esquerda */
          td:nth-child(3) { text-align: left !important; padding-left: 12px !important; }
          td:nth-child(2), td:nth-child(n+4) { text-align: center !important; }
        }
      `}} />
    </div>
  );
}