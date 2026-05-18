import { Outlet } from 'react-router-dom';
import { BarraLateralAdmin } from './BarraLateralAdmin';
import { ToastsAdmin } from './ToastsAdmin';

export function LayoutAdmin() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <BarraLateralAdmin />
      <ToastsAdmin />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
        <main className="flex-1 pt-6 px-8 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
