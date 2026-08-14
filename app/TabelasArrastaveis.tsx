"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, parseISO, addDays, isAfter } from 'date-fns';
import { Pencil, CheckCircle, RotateCcw, Trash2, GripVertical } from 'lucide-react';
import { 
  atualizarOrdemRelatorios, 
  atualizarOrdemAudiencias,
  atualizarOrdemAdolescentes,
  atualizarOrdemControle, 
  arquivarRelatorio, 
  reativarRelatorio, 
  arquivarAudiencia, 
  reativarAudiencia,
  arquivarAdolescente,
  reativarAdolescente,
  arquivarControleInternacao,
  reativarControleInternacao,
  deleteGeneral 
} from "./actions";

// ==========================================
// --- TABELA 1: FASE (45 DIAS)
// ==========================================
function LinhaAdolescente({ item, index, currentTab }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, backgroundColor: isDragging ? "#dcfce7" : undefined, zIndex: isDragging ? 10 : 1, position: isDragging ? ("relative" as const) : ("static" as const) };
  
  const dataSaida = addDays(parseISO(item.dataApreensao), 44);
  const isVencido = isAfter(new Date(), dataSaida);

  return (
    <tr ref={currentTab === 'ativos' ? setNodeRef : null} style={currentTab === 'ativos' ? style : {}} className="hover:bg-green-50/20 transition group print:break-inside-avoid bg-white">
      <td className="p-4 w-12 text-center no-print">
        {currentTab === 'ativos' && (
          <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-green-500 transition inline-block" {...attributes} {...listeners}>
            <GripVertical size={18} />
          </div>
        )}
      </td>
      <td className="p-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
      <td className="p-4 font-bold uppercase print:text-black print:text-xs">{item.nome}</td>
      <td className="p-4 text-center print:text-black print:text-xs">{format(parseISO(item.dataApreensao), 'dd/MM/yyyy')}</td>
      <td className="p-4 text-center print:text-black print:text-xs">{format(parseISO(item.dataAdmissao), 'dd/MM/yyyy')}</td>
      
      {currentTab === "ativos" ? (
        <td className="p-4 text-center font-black bg-green-50/30 text-green-600 print:text-black print:text-xs">
          {format(dataSaida, 'dd/MM/yyyy')} 
          {isVencido && <span className="block text-[9px] uppercase font-bold text-green-700 no-print mt-1">Prazo Alcançado ✅</span>}
        </td>
      ) : (
        <td className="p-4 text-center">
          <div className="font-bold text-blue-700 uppercase text-[10px] print:text-black print:text-xs">{item.motivoSaida}</div>
          {item.observacao && <div className="text-[10px] text-slate-400 italic print:text-black print:text-[9px]">Obs: {item.observacao}</div>}
        </td>
      )}

      <td className="p-4 text-center no-print w-48">
          {currentTab === 'ativos' ? (
            <form action={arquivarAdolescente} className="flex flex-col gap-1 items-center bg-slate-50 p-2 rounded border border-slate-200">
              <input type="hidden" name="id" value={item.id} />
              <div className="flex w-full gap-1">
                <select name="motivo" className="text-[10px] border rounded p-1 w-full bg-white outline-none cursor-pointer">
                  <option value="DESLIGADO">DESLIGADO</option>
                  <option value="INTERNAÇÃO">INTERNAÇÃO</option>
                </select>
                <a href={`?mod=internacao&tab=${currentTab}&editId=${item.id}`} className="bg-blue-100 text-blue-600 p-1.5 rounded hover:bg-blue-200" title="Editar"><Pencil size={14}/></a>
              </div>
              <input name="observacao" placeholder="Observações" className="text-[10px] border rounded p-1 w-full outline-none" />
              <button className="text-green-600 flex items-center justify-center gap-1 font-bold text-[10px] uppercase hover:underline mt-1 w-full"><CheckCircle size={14} /> Dar Baixa</button>
            </form>
          ) : (
            <div className="flex justify-center gap-2 items-center">
              <a href={`?mod=internacao&tab=${currentTab}&editId=${item.id}`} className="text-blue-500 hover:bg-blue-50 p-1 rounded transition" title="Editar"><Pencil size={18}/></a>
              <form action={reativarAdolescente.bind(null, item.id)}><button type="submit" className="text-orange-500 hover:bg-orange-50 p-1 rounded transition" title="Reativar"><RotateCcw size={18}/></button></form>
              <form action={deleteGeneral.bind(null, item.id, 'ado')}><button type="submit" className="text-slate-300 hover:text-red-600 p-1 transition" title="Excluir"><Trash2 size={18}/></button></form>
            </div>
          )}
      </td>
    </tr>
  );
}

export function TabelaAdolescentes({ dados, currentTab }: { dados: any[], currentTab: string }) {
  const [itens, setItens] = useState(dados);
  useEffect(() => { setItens(dados); }, [dados]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItens((itemsAtuais) => {
        const oldIndex = itemsAtuais.findIndex((i) => i.id === active.id);
        const newIndex = itemsAtuais.findIndex((i) => i.id === over.id);
        const novaLista = arrayMove(itemsAtuais, oldIndex, newIndex);
        const dadosParaSalvar = novaLista.map((item, index) => ({ id: item.id, ordem: index }));
        atualizarOrdemAdolescentes(dadosParaSalvar);
        return novaLista;
      });
    }
  }

  return (
    <div className="overflow-x-auto">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itens.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold border-b print:bg-gray-200">
                <th className="p-4 w-12 text-center no-print"></th>
                <th className="p-4 w-12">#</th>
                <th className="p-4 text-left">Nome Completo</th>
                <th className="p-4 text-center">Apreensão</th>
                <th className="p-4 text-center">Admissão Unidade</th>
                {currentTab === "ativos" ? <th className="p-4 text-center text-green-700">Prazo 45 Dias</th> : <th className="p-4 text-center">Desfecho / Obs</th>}
                <th className="p-4 text-center no-print">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itens.map((item, index) => <LinhaAdolescente key={item.id} item={item} index={index} currentTab={currentTab} />)}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ==========================================
// --- TABELA 2: CONTROLE INTERNAÇÃO GERAL
// ==========================================
function LinhaControleInternacao({ item, index, currentTab }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, backgroundColor: isDragging ? "#dbeafe" : undefined, zIndex: isDragging ? 10 : 1, position: isDragging ? ("relative" as const) : ("static" as const) };

  return (
    <tr ref={currentTab === 'ativos' ? setNodeRef : null} style={currentTab === 'ativos' ? style : {}} className="hover:bg-blue-50/10 transition group print:break-inside-avoid bg-white">
      <td className="p-4 w-12 text-center no-print">
        {currentTab === 'ativos' && (
          <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-blue-500 transition inline-block" {...attributes} {...listeners}>
            <GripVertical size={18} />
          </div>
        )}
      </td>
      <td className="p-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
      <td className="p-4 font-bold uppercase print:text-black print:text-xs">{item.nome}</td>
      <td className="p-4 text-center">
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase print:text-black print:text-[10px] print:p-0 ${item.tipo === 'Internação Provisória' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'}`}>
          {item.tipo}
        </span>
      </td>
      <td className="p-4 text-center font-bold text-slate-700 print:text-black print:text-xs">{format(parseISO(item.dataAdmissao), 'dd/MM/yyyy')}</td>
      <td className="p-4 text-center font-bold uppercase print:text-black print:text-xs">{item.comarca}</td>
      <td className="p-4 text-center no-print flex justify-center items-center gap-2">
        <a href={`?mod=controle_internacao&tab=${currentTab}&editId=${item.id}`} className="text-blue-500 hover:bg-blue-50 p-1 rounded transition" title="Editar"><Pencil size={18}/></a>
        {currentTab === 'ativos' ? (
          <form action={arquivarControleInternacao.bind(null, item.id)}><button type="submit" className="text-blue-600 hover:bg-blue-50 p-1 rounded transition" title="Dar Baixa"><CheckCircle size={18}/></button></form>
        ) : (
          <form action={reativarControleInternacao.bind(null, item.id)}><button type="submit" className="text-orange-500 hover:bg-orange-50 p-1 rounded transition" title="Reativar"><RotateCcw size={18}/></button></form>
        )}
        <form action={deleteGeneral.bind(null, item.id, 'ctrl')}><button type="submit" className="text-slate-300 hover:text-red-600 p-1 transition"><Trash2 size={18}/></button></form>
      </td>
    </tr>
  );
}

export function TabelaControleInternacao({ dados, currentTab }: { dados: any[], currentTab: string }) {
  const [itens, setItens] = useState(dados);
  useEffect(() => { setItens(dados); }, [dados]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItens((itemsAtuais) => {
        const oldIndex = itemsAtuais.findIndex((i) => i.id === active.id);
        const newIndex = itemsAtuais.findIndex((i) => i.id === over.id);
        const novaLista = arrayMove(itemsAtuais, oldIndex, newIndex);
        const dadosParaSalvar = novaLista.map((item, index) => ({ id: item.id, ordem: index }));
        atualizarOrdemControle(dadosParaSalvar);
        return novaLista;
      });
    }
  }

  return (
    <div className="overflow-x-auto">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itens.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold border-b print:bg-gray-100">
                <th className="p-4 w-12 text-center no-print"></th>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4 text-left">Nome</th>
                <th className="p-4 text-center">Tipo de Sistema</th>
                <th className="p-4 text-center">Admissão</th>
                <th className="p-4 text-center">Comarca</th>
                <th className="p-4 text-center no-print">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itens.map((item, index) => <LinhaControleInternacao key={item.id} item={item} index={index} currentTab={currentTab} />)}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// --- (MANTENHA OS COMPONENTES TabelaRelatorios E TabelaAudiencias QUE JÁ EXISTIAM NO FINAL) ---

function LinhaRelatorio({ item, index, currentTab }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, backgroundColor: isDragging ? "#e0e7ff" : undefined, zIndex: isDragging ? 10 : 1, position: isDragging ? ("relative" as const) : ("static" as const) };

  return (
    <tr ref={currentTab === 'ativos' ? setNodeRef : null} style={currentTab === 'ativos' ? style : {}} className="hover:bg-indigo-50/10 transition group print:break-inside-avoid bg-white">
      <td className="p-4 w-12 text-center no-print">
        {currentTab === 'ativos' && (
          <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-indigo-500 transition inline-block" {...attributes} {...listeners}>
            <GripVertical size={18} />
          </div>
        )}
      </td>
      <td className="p-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
      <td className="p-4 font-bold uppercase print:text-black print:text-xs">{item.nome}</td>
      <td className="p-4 text-center font-mono text-xs print:text-black print:text-xs">{item.nProcesso}</td>
      <td className="p-4 text-center font-bold text-indigo-700 print:text-black print:text-xs">{format(parseISO(item.dataEntrega), 'dd/MM/yyyy')}</td>
      <td className="p-4 text-center no-print flex justify-center items-center gap-2">
        <a href={`?mod=relatorios&tab=${currentTab}&editId=${item.id}`} className="text-blue-500 hover:bg-blue-50 p-1 rounded transition" title="Editar"><Pencil size={18}/></a>
        {currentTab === 'ativos' ? (
          <form action={arquivarRelatorio.bind(null, item.id)}><button type="submit" className="text-green-600 hover:bg-green-50 p-1 rounded transition" title="Marcar como Entregue"><CheckCircle size={18}/></button></form>
        ) : (
          <form action={reativarRelatorio.bind(null, item.id)}><button type="submit" className="text-orange-500 hover:bg-orange-50 p-1 rounded transition" title="Reativar"><RotateCcw size={18}/></button></form>
        )}
        <form action={deleteGeneral.bind(null, item.id, 'rel')}><button type="submit" className="text-slate-300 hover:text-red-600 p-1 transition"><Trash2 size={18}/></button></form>
      </td>
    </tr>
  );
}

export function TabelaRelatorios({ dados, currentTab }: { dados: any[], currentTab: string }) {
  const [itens, setItens] = useState(dados);
  useEffect(() => { setItens(dados); }, [dados]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItens((itemsAtuais) => {
        const oldIndex = itemsAtuais.findIndex((i) => i.id === active.id);
        const newIndex = itemsAtuais.findIndex((i) => i.id === over.id);
        const novaLista = arrayMove(itemsAtuais, oldIndex, newIndex);
        const dadosParaSalvar = novaLista.map((item, index) => ({ id: item.id, ordem: index }));
        atualizarOrdemRelatorios(dadosParaSalvar);
        return novaLista;
      });
    }
  }

  return (
    <div className="overflow-x-auto">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itens.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold border-b print:bg-gray-100">
                <th className="p-4 w-12 text-center no-print"></th>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4 text-left">Nome</th>
                <th className="p-4 text-center">Processo</th>
                <th className="p-4 text-center">Data Limite / Entrega</th>
                <th className="p-4 text-center no-print">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itens.map((item, index) => <LinhaRelatorio key={item.id} item={item} index={index} currentTab={currentTab} />)}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function LinhaAudiencia({ item, index, currentTab }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, backgroundColor: isDragging ? "#d1fae5" : undefined, zIndex: isDragging ? 10 : 1, position: isDragging ? ("relative" as const) : ("static" as const) };

  return (
    <tr ref={currentTab === 'ativos' ? setNodeRef : null} style={currentTab === 'ativos' ? style : {}} className="hover:bg-emerald-50/10 transition group print:break-inside-avoid bg-white">
      <td className="p-4 w-12 text-center no-print">
        {currentTab === 'ativos' && (
          <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-emerald-500 transition inline-block" {...attributes} {...listeners}>
            <GripVertical size={18} />
          </div>
        )}
      </td>
      <td className="p-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
      <td className="p-4 font-bold text-emerald-800 uppercase print:text-black print:text-xs">{item.nProcesso}</td>
      <td className="p-4 uppercase text-[11px] leading-relaxed italic print:text-black print:text-[10px]">{item.nomes}</td>
      <td className="p-4 text-center font-bold print:text-black print:text-xs">{format(parseISO(item.data), 'dd/MM/yy')} às {item.hora}</td>
      <td className="p-4 text-center no-print flex justify-center items-center gap-2">
        <a href={`?mod=audiencias&tab=${currentTab}&editId=${item.id}`} className="text-blue-500 hover:bg-blue-50 p-1 rounded transition" title="Editar"><Pencil size={18}/></a>
        {currentTab === 'ativos' ? (
          <form action={arquivarAudiencia.bind(null, item.id)}><button type="submit" className="text-green-600 hover:bg-green-50 p-1 rounded transition" title="Concluir Audiência"><CheckCircle size={18}/></button></form>
        ) : (
          <form action={reativarAudiencia.bind(null, item.id)}><button type="submit" className="text-orange-500 hover:bg-orange-50 p-1 rounded transition" title="Reativar"><RotateCcw size={18}/></button></form>
        )}
        <form action={deleteGeneral.bind(null, item.id, 'aud')}><button type="submit" className="text-slate-300 hover:text-red-600 p-1 transition"><Trash2 size={18}/></button></form>
      </td>
    </tr>
  );
}

export function TabelaAudiencias({ dados, currentTab }: { dados: any[], currentTab: string }) {
  const [itens, setItens] = useState(dados);
  useEffect(() => { setItens(dados); }, [dados]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItens((itemsAtuais) => {
        const oldIndex = itemsAtuais.findIndex((i) => i.id === active.id);
        const newIndex = itemsAtuais.findIndex((i) => i.id === over.id);
        const novaLista = arrayMove(itemsAtuais, oldIndex, newIndex);
        const dadosParaSalvar = novaLista.map((item, index) => ({ id: item.id, ordem: index }));
        atualizarOrdemAudiencias(dadosParaSalvar);
        return novaLista;
      });
    }
  }

  return (
    <div className="overflow-x-auto">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itens.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold border-b print:bg-gray-100">
                <th className="p-4 w-12 text-center no-print"></th>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4 text-left">Processo</th>
                <th className="p-4 text-left">Adolescentes</th>
                <th className="p-4 text-center">Data / Hora</th>
                <th className="p-4 text-center no-print">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itens.map((item, index) => <LinhaAudiencia key={item.id} item={item} index={index} currentTab={currentTab} />)}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  );
}