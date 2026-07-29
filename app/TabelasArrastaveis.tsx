"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, parseISO } from 'date-fns';
import { Pencil, CheckCircle, RotateCcw, Trash2, GripVertical } from 'lucide-react';
import { 
  atualizarOrdemRelatorios, 
  atualizarOrdemAudiencias, 
  arquivarRelatorio, 
  reativarRelatorio, 
  arquivarAudiencia, 
  reativarAudiencia, 
  deleteGeneral 
} from "./actions";

// ==========================================
// --- TABELA RELATÓRIOS
// ==========================================
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
      <td className="p-4 font-bold uppercase print:text-black print:text-base">{item.nome}</td>
      <td className="p-4 text-center font-mono text-xs print:text-black print:text-base">{item.nProcesso}</td>
      <td className="p-4 text-center font-bold text-indigo-700 print:text-black print:text-base">{format(parseISO(item.dataEntrega), 'dd/MM/yyyy')}</td>
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

// ==========================================
// --- TABELA AUDIÊNCIAS
// ==========================================
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
      <td className="p-4 font-bold text-emerald-800 uppercase print:text-black print:text-base">{item.nProcesso}</td>
      <td className="p-4 uppercase text-[11px] leading-relaxed italic print:text-black print:text-base">{item.nomes}</td>
      <td className="p-4 text-center font-bold print:text-black print:text-base">{format(parseISO(item.data), 'dd/MM/yy')} às {item.hora}</td>
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