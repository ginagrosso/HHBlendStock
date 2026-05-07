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
  const [porcentajeEfectivo, setPorcentajeEfectivo] = useState(0);
  const [porcentajeTarjeta, setPorcentajeTarjeta] = useState(0);
  const [guardando, setGuardando] = useState(false);

  if (!abierto) return null;

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (porcentajeEfectivo === 0 && porcentajeTarjeta === 0) return;

    setGuardando(true);
    try {
      await ajustarPreciosMasivo(categoria, porcentajeEfectivo, porcentajeTarjeta);
      agregarNotificacion(
        `Precios ajustados: Efectivo ${porcentajeEfectivo > 0 ? '+' : ''}${porcentajeEfectivo}% | Tarjeta ${porcentajeTarjeta > 0 ? '+' : ''}${porcentajeTarjeta}% en ${categoria === 'Todas' ? 'todas las categorías' : categoria}.`,
        'exito'
      );
      onCerrar();
    } catch {
      agregarNotificacion('Error al ajustar los precios.', 'error');
    } finally {
      setGuardando(false);
    }
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Porcentaje Efectivo
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.01"
                  value={porcentajeEfectivo === 0 ? '' : porcentajeEfectivo}
                  onChange={(e) => setPorcentajeEfectivo(Number(e.target.value))}
                  placeholder="Ej: 12.5"
                  className="bg-transparent border border-amber-500/50 focus:border-amber-500 rounded px-3 py-2 pr-10 text-sm text-neutral-100 outline-none w-full"
                />
                <span className="absolute right-3 text-neutral-400 font-semibold">%</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Porcentaje Tarjeta
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.01"
                  value={porcentajeTarjeta === 0 ? '' : porcentajeTarjeta}
                  onChange={(e) => setPorcentajeTarjeta(Number(e.target.value))}
                  placeholder="Ej: 10"
                  className="bg-transparent border border-amber-500/50 focus:border-amber-500 rounded px-3 py-2 pr-10 text-sm text-neutral-100 outline-none w-full"
                />
                <span className="absolute right-3 text-neutral-400 font-semibold">%</span>
              </div>
            </div>
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
              disabled={guardando}
              className="px-6 py-2 rounded bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {guardando ? 'Aplicando...' : 'Aplicar Aumento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
