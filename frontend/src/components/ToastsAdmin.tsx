import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

import { useTiendaStore } from '../stores/useTiendaStore';

const iconosPorTipo = {
  exito: CheckCircle2,
  info: Info,
  advertencia: AlertTriangle,
  error: XCircle,
};

export function ToastsAdmin() {
  const notificaciones = useTiendaStore((state) => state.notificaciones);
  const quitarNotificacion = useTiendaStore((state) => state.quitarNotificacion);

  useEffect(() => {
    if (notificaciones.length === 0) {
      return;
    }

    const timers = notificaciones.map((toast) =>
      window.setTimeout(() => {
        quitarNotificacion(toast.id);
      }, 3500)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [notificaciones, quitarNotificacion]);

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3">
      {notificaciones.map((toast) => {
        const Icono = iconosPorTipo[toast.tipo];
        return (
          <div
            key={toast.id}
            className="flex items-center gap-3 bg-black/90 border border-amber-500/40 rounded px-4 py-3 shadow-xl backdrop-blur-sm min-w-[240px]"
          >
            <Icono className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-neutral-100">{toast.mensaje}</span>
            <button
              type="button"
              onClick={() => quitarNotificacion(toast.id)}
              className="ml-auto text-neutral-500 hover:text-amber-500 transition-colors"
              aria-label="Cerrar notificacion"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
