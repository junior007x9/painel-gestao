"use client";

import { useState } from "react";
import { Plus, UserPlus, X, Edit, XCircle } from "lucide-react";
import { addAudiencia, editAudiencia } from "./actions";

// Recebe a propriedade opcional 'editData' vinda da página principal
export default function AudienciaForm({ editData }: { editData?: any }) {
  // Se houver dados de edição, divide a string de nomes pela vírgula. Se não, inicia vazio.
  const [nomes, setNomes] = useState<string[]>(editData ? editData.nomes.split(", ") : [""]);

  const adicionarCampo = () => {
    setNomes([...nomes, ""]);
  };

  const removerCampo = (indexToRemove: number) => {
    if (nomes.length > 1) {
      setNomes(nomes.filter((_, index) => index !== indexToRemove));
    }
  };

  return (
    <div className={`p-6 border-b no-print ${editData ? 'bg-amber-50' : 'bg-emerald-50/30'}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-xs font-bold uppercase flex items-center gap-2 ${editData ? 'text-amber-700' : 'text-emerald-700'}`}>
          {editData ? <><Edit size={16}/> Editar Audiência Judicial</> : <><UserPlus size={16}/> Agendar Nova Audiência</>}
        </h3>
        
        {/* Botão de Cancelar Edição (Só aparece se estiver no modo edição) */}
        {editData && (
          <a href="?mod=audiencias" className="text-red-500 flex items-center gap-1 text-[10px] font-black uppercase hover:bg-red-50 p-2 rounded transition">
            <XCircle size={16}/> Cancelar Edição
          </a>
        )}
      </div>
      
      {/* Altera a Action do formulário baseado no modo (Adicionar ou Editar) */}
      <form action={editData ? editAudiencia : addAudiencia} className="flex flex-col gap-4">
        {/* Campo oculto com o ID necessário para a edição */}
        {editData && <input type="hidden" name="id" value={editData.id} />}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LADO ESQUERDO: Litisconsórcio (Nomes) */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase text-slate-500">Adolescentes no Processo</label>
              <button 
                type="button" 
                onClick={adicionarCampo}
                className={`p-1.5 rounded-full transition shadow-sm border ${editData ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200'}`}
                title="Adicionar mais um adolescente"
              >
                <Plus size={14} />
              </button>
            </div>
            
            {/* Renderiza os campos dinamicamente com defaultValue caso exista */}
            <div className="flex flex-col gap-2">
              {nomes.map((nomeVal, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input 
                    name="nomes" 
                    required 
                    defaultValue={editData ? nomeVal : ""}
                    className={`w-full border border-slate-300 p-2 rounded text-sm uppercase outline-none focus:ring-2 ${editData ? 'focus:ring-amber-500' : 'focus:ring-emerald-500'}`} 
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
              <input 
                name="processo" 
                required 
                defaultValue={editData?.nProcesso}
                className={`w-full border border-slate-300 p-2 rounded text-sm outline-none focus:ring-2 ${editData ? 'focus:ring-amber-500' : 'focus:ring-emerald-500'}`} 
                placeholder="EX: 0001234-56..." 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Data</label>
                <input 
                  name="data" 
                  type="date" 
                  required 
                  defaultValue={editData?.data}
                  className={`w-full border border-slate-300 p-2 rounded text-sm outline-none focus:ring-2 ${editData ? 'focus:ring-amber-500' : 'focus:ring-emerald-500'}`} 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Hora</label>
                <input 
                  name="hora" 
                  type="time" 
                  required 
                  defaultValue={editData?.hora}
                  className={`w-full border border-slate-300 p-2 rounded text-sm outline-none focus:ring-2 ${editData ? 'focus:ring-amber-500' : 'focus:ring-emerald-500'}`} 
                />
              </div>
            </div>
            
            {/* Botão alinhado embaixo (Dinâmico) */}
            <button 
              type="submit" 
              className={`mt-auto text-white font-bold py-3 rounded text-sm shadow-md uppercase transition active:scale-95 ${editData ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {editData ? "Salvar Alterações" : "Confirmar Agendamento"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}