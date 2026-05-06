import { createBrowserRouter } from 'react-router-dom';
import { LayoutAdmin } from '../components/LayoutAdmin';
import { PaginaInventarioAdmin } from '../pages/admin/PaginaInventarioAdmin';

const PaginaNoEncontrada = () => (
  <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
    <p className="text-neutral-400">Ruta no encontrada.</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/admin',
    element: <LayoutAdmin />,
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
    path: '*',
    element: <PaginaNoEncontrada />,
  },
]);
