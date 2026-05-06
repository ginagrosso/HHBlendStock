import { Bell, HelpCircle, Search } from 'lucide-react';
import { useTiendaStore } from '../stores/useTiendaStore';

export function BarraSuperiorAdmin() {
  const busquedaQuery = useTiendaStore((state) => state.busquedaQuery);
  const setBusquedaQuery = useTiendaStore((state) => state.setBusquedaQuery);

  return (
    <header className="flex justify-between items-center h-16 px-8 fixed top-0 right-0 z-40 border-b border-neutral-900 bg-black/80 backdrop-blur-md w-full md:w-[calc(100%-16rem)]">
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 h-4 w-4" />
          <input
            className="w-full bg-transparent border-b border-neutral-800 focus:border-amber-500 px-10 py-2 text-sm outline-none transition-colors"
            placeholder="Buscar productos..."
            type="text"
            value={busquedaQuery}
            onChange={(event) => setBusquedaQuery(event.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button
          type="button"
          className="text-neutral-400 hover:text-amber-500 transition-colors active:scale-95 duration-200"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="text-neutral-400 hover:text-amber-500 transition-colors active:scale-95 duration-200"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-neutral-900 border border-amber-500/20 overflow-hidden flex-shrink-0 cursor-pointer hover:border-amber-500 transition-colors" />
      </div>
    </header>
  );
}
