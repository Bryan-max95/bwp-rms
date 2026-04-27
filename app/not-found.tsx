import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 bg-slate-100 text-slate-300 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-6">
        <FileQuestion size={48} className="-rotate-6" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-2">Página no encontrada</h2>
      <p className="text-slate-500 font-medium max-w-sm mb-8">
        Lo sentimos, la sección que intentas buscar no existe o ha sido movida.
      </p>
      <Link 
        href="/"
        className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 transition-all"
      >
        <Home size={20} />
        Volver al Dashboard
      </Link>
    </div>
  );
}
