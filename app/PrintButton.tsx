"use client"; // Isso avisa o Next que este componente pode ter cliques

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="mt-4 no-print flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg mx-auto hover:bg-slate-700 transition text-sm font-bold shadow-lg"
    >
      <Printer size={18} /> EXPORTAR PDF / IMPRIMIR
    </button>
  );
}