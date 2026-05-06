import { X } from 'lucide-react';
import { useState } from 'react';
import { useTiendaStore } from '../stores/useTiendaStore';

interface ModalAjustePreciosProps {
  abierto: boolean;
  onCerrar: () => void;
}

export function ModalAjustePrecios({ abierto, onCerrar }: ModalAjustePreciosProps) {
  const categorias = useTiendaStore((state) => state.categorias);
  const ajustarPreciosMasivo = useTiendaStore((state) => state.ajustarPreciosMasivo);
  const agregarNotificacion = useTiendaStore((state) => state.agregarNotificacion);

  const [categoria, setCategoria] = useState('Todas');
  const [porcentaje, setPorcentaje] = useState(0);

  if (!abierto) return null;

  const manejarGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (porcentaje === 0) return;
    
    ajustarPreciosMasivo(categoria, porcentaje);
    agregarNotificacion(`Precios ajustados (${porcentaje > 0 ? '+' : ''}${porcentaje}%) en ${categoria === 'Todas' ? 'todas las categorias' : categoria}.`, 'exito');
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onCerrar}
      />
      <div className="relative w-full max-w-md bg-neutral-950 border border-amber-500/20 rounded p-6 shadow-xl transition-all">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
            <span className="text-amber-500 text-xs">▲</span> Ajuste Masivo de Precios
          </h3>
          <button
            type="button"
            onClick={onCerrar}
            className="text-neutral-500 hover:text-amber-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="flex flex-col gap-6" onSubmit={manejarGuardar}>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Categoría a actualizar
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-sm text-neutral-100 outline-none w-full"
            >
              <option value="Todas">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Porcentaje de ajuste
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.01"
                value={porcentaje === 0 ? '' : porcentaje}
                onChange={(e) => setPorcentaje(Number(e.target.value))}
                placeholder="Ej: 12.5"
                className="bg-transparent border border-amber-500/50 focus:border-amber-500 rounded px-3 py-2 pr-10 text-sm text-neutral-100 outline-none w-full"
                required
              />
              <span className="absolute right-3 text-neutral-400 font-semibold">%</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Positivo para aumentar (+12.5), negativo para descontar (-10).
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 rounded text-sm text-neutral-300 hover:text-neutral-100 transition-colors"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition-colors uppercase tracking-wider"
            >
              Aplicar Aumento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}