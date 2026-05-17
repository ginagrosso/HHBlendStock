import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import {
  BadgeDollarSign,
  BarChart2,
  Box,
  LogOut,
  Settings,
  Tag,
} from 'lucide-react';

const enlaces = [
  {
    etiqueta: 'Caja',
    ruta: '/admin/caja',
    Icono: BadgeDollarSign,
  },
  {
    etiqueta: 'Inventario',
    ruta: '/admin/inventario',
    Icono: Box,
  },
  {
    etiqueta: 'Actualizar Precios',
    ruta: '/admin/precios',
    Icono: Tag,
  },
  {
    etiqueta: 'Reportes',
    ruta: '/admin/reportes',
    Icono: BarChart2,
  },
];

export function BarraLateralAdmin() {
  const { cerrarSesion } = useAuthStore()
  const navigate = useNavigate()

  const handleCerrarSesion = async () => {
    await cerrarSesion()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="hidden md:flex flex-col h-screen overflow-y-auto fixed left-0 top-0 w-64 border-r border-neutral-900 bg-black z-50">
      <div className="px-6 py-8 border-b border-neutral-900">
        <h1 className="text-xl font-bold tracking-[0.2em] text-amber-500 uppercase">
          H&H BLEND
        </h1>
        <p className="text-neutral-500 text-xs mt-1">Alta Costura</p>
      </div>
      <div className="flex-1 py-6 flex flex-col gap-2">
        {enlaces.map(({ etiqueta, ruta, Icono }) => (
          <NavLink
            key={ruta}
            to={ruta}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-6 py-4 text-sm transition-colors',
                isActive
                  ? 'text-amber-500 bg-neutral-900/60 border-r-2 border-amber-500'
                  : 'text-neutral-500 hover:bg-neutral-900/30 hover:text-amber-200',
              ].join(' ')
            }
          >
            <Icono className="h-5 w-5" />
            <span>{etiqueta}</span>
          </NavLink>
        ))}
      </div>
      <div className="py-6 border-t border-neutral-900 flex flex-col gap-2">
        <NavLink
          to="/admin/ajustes"
          className={({ isActive }) =>
            [
              'flex items-center gap-3 px-6 py-4 text-sm transition-colors',
              isActive
                ? 'text-amber-500 bg-neutral-900/60 border-r-2 border-amber-500'
                : 'text-neutral-500 hover:bg-neutral-900/30 hover:text-amber-200',
            ].join(' ')
          }
        >
          <Settings className="h-5 w-5" />
          <span>Ajustes</span>
        </NavLink>
        <button
          type="button"
          onClick={handleCerrarSesion}
          className="flex items-center gap-3 px-6 py-4 text-sm text-neutral-500 hover:bg-neutral-900/30 hover:text-amber-200 transition-colors w-full text-left"
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </nav>
  );
}
