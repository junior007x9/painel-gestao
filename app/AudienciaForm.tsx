"use client";

import { useState } from "react";
import { Plus, UserPlus, X } from "lucide-react";
import { addAudiencia } from "./actions";

export default function AudienciaForm() {
  const [nomes, setNomes] = useState<string[]>([""]);

  const adicionarCampo = () => {
    setNomes([...nomes, ""]);
  };

  const removerCampo = (indexToRemove: number) => {
    if (nomes.length > 1) {
      setNomes(nomes.filter((_, index) => index !== indexToRemove));
    }
  };

  return (
    <div className="p-6 border-b bg-emerald-50/30 no-print">
      <h3 className="text-xs font-bold uppercase text-emerald-700 mb-6 flex items-center gap-2">
        <UserPlus size={16}/> Agendar Nova Audiência
      </h3>
      
      <form action={addAudiencia} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LADO ESQUERDO: Litisconsórcio (Nomes) */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase text-slate-500">Adolescentes no Processo</label>
              <button 
                type="button" 
                onClick={adicionarCampo}
                className="bg-emerald-100 text-emerald-700 p-1.5 rounded-full hover:bg-emerald-200 transition shadow-sm border border-emerald-300"
                title="Adicionar mais um adolescente"
              >
                <Plus size={14} />
              </button>
            </div>
            
            {/* Renderiza os campos dinamicamente */}
            <div className="flex flex-col gap-2">
              {nomes.map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input 
                    name="nomes" 
                    required 
                    className="w-full border border-slate-300 p-2 rounded text-sm uppercase outline-none focus:ring-2 focus:ring-emerald-500" 
                    placeholder={`${index + 1}º ADOLESCENTE`} 
                  />
                  {nomes.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removerCampo(index)} 
                      className="text-slate-300 hover:text-red-500 transition p-1"
                      title="Remover este campo"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* LADO DIREITO: Dados do Processo e Data */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nº do Processo</label>
              <input name="processo" required className="w-full border border-slate-300 p-2 rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="EX: 0001234-56..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Data</label>
                <input name="data" type="date" required className="w-full border border-slate-300 p-2 rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Hora</label>
                <input name="hora" type="time" required className="w-full border border-slate-300 p-2 rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            
            {/* Botão alinhado embaixo */}
            <button type="submit" className="mt-auto bg-emerald-600 text-white font-bold py-3 rounded text-sm shadow-md uppercase hover:bg-emerald-700 transition active:scale-95">
              Confirmar Agendamento
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}