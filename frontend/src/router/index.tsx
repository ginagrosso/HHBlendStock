/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LayoutAdmin } from '../components/LayoutAdmin';
import { PaginaInventarioAdmin } from '../pages/admin/PaginaInventarioAdmin';
import { PaginaLogin } from '../pages/public/PaginaLogin';
import { RutaPrivada } from '../components/RutaPrivada';

const PaginaNoEncontrada = () => (
  <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
    <p className="text-neutral-400">Ruta no encontrada.</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <PaginaLogin />,
  },
  {
    path: '/admin',
    element: (
      <RutaPrivada>
        <LayoutAdmin />
      </RutaPrivada>
    ),
    children: [
      {
        path: 'inventario',
        element: <PaginaInventarioAdmin />,
      },
      {
        index: true,
        element: <PaginaInventarioAdmin />,
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/admin/inventario" replace />,
  },
  {
    path: '*',
    element: <PaginaNoEncontrada />,
  },
]);
